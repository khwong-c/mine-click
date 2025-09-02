package click

import (
	"context"
	"log/slog"
	"time"

	"github.com/juju/errors"
	"github.com/samber/lo"
)

const syncPeriod = 5 * time.Second
const syncTimeout = 1 * time.Second

var errFailureAfterWrite = errors.New("Read Failure After Write")

func (c *Click) syncClicks(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, syncTimeout)
	defer cancel()
	c.Lock()
	defer c.Unlock()
	clickRec, err := c.datastore.GetClicks(ctx)
	if err != nil {
		return errors.Trace(err)
	}

	validTypes := lo.Uniq(append(lo.Keys(clickRec.Clicks), lo.Keys(PermittedClickType)...))
	sum := lo.SliceToMap(validTypes, func(k string) (string, int) {
		return k, clickRec.Clicks[k] + int(c.clicksInMem[k].Load())
	})
	if err := c.datastore.StoreClicks(ctx, sum); err != nil {
		return errors.Trace(err)
	}

	latest, err := c.datastore.GetClicks(ctx)
	if err != nil {
		return errors.Wrap(errFailureAfterWrite, errors.Trace(err))
	}
	for k := range c.clicksInMem {
		c.clicksInMem[k].Store(0)
	}
	c.clickFromStore = latest.Clicks
	c.latestID = latest.ID
	return nil
}

func (c *Click) logSyncErr(err error) {
	slog.Error(
		"Error on syncing clicks",
		"error", err.Error(),
		"trace", errors.ErrorStack(errors.Trace(err)),
		"lastGoodID", c.latestID,
		"clickMem", c.clicksInMem,
		"clickStore", c.clickFromStore,
		"failureAfterWrite", errors.Is(err, errFailureAfterWrite),
	)
}

func (c *Click) syncWorker() {
	ticker := time.Tick(syncPeriod)
	for {
		select {
		case <-ticker:
			if err := c.syncClicks(context.Background()); err != nil {
				c.logSyncErr(err)
			}
		case <-c.shutdownSignal:
			return
		}
	}
}
