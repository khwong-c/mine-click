package click

import (
	"context"
	"log/slog"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/juju/errors"
	"github.com/samber/do"
	"github.com/samber/lo"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/features/click/datastore"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
)

var PermittedClickType = lo.Keyify([]string{
	"Stone",
	"Coal",
	"Iron",
	"Gold",
	"Diamond",
	"Redstone",
})

type Click struct {
	*sync.RWMutex
	injector   *do.Injector
	syncPeriod time.Duration

	datastore      datastore.ClickStore
	clickQueue     chan string
	clicksInMem    map[string]*atomic.Int64
	clickFromStore map[string]int
	latestID       uuid.UUID

	shutdownSignal chan struct{}
}

func (c *Click) GetClicks() map[string]int {
	c.RLock()
	defer c.RUnlock()
	return lo.MapEntries(PermittedClickType, func(k string, _ struct{}) (string, int) {
		return k, int(c.clicksInMem[k].Load()) + c.clickFromStore[k]
	})
}

func (c *Click) AddClick(clickType string) {
	if _, ok := PermittedClickType[clickType]; !ok {
		return
	}
	c.clicksInMem[clickType].Add(1)
}

func (c *Click) Shutdown() error {
	c.shutdownSignal <- struct{}{}
	if err := c.syncClicks(context.Background()); err != nil {
		c.logSyncErr(err)
		return errors.Trace(err)
	}
	slog.Info("Successfully shutdown clicks")
	return nil
}

func NewClick(injector *do.Injector) (*Click, error) {
	const clickQueueSize = 128
	cfg := di.InvokeOrProvide(injector, config.LoadConfig)
	newClick := &Click{
		injector:   injector,
		RWMutex:    &sync.RWMutex{},
		clickQueue: make(chan string, clickQueueSize),
		clicksInMem: lo.SliceToMap(
			lo.Keys(PermittedClickType), func(k string) (string, *atomic.Int64) {
				return k, &atomic.Int64{}
			},
		),
		datastore:      di.InvokeOrProvide(injector, datastore.NewClickStore),
		shutdownSignal: make(chan struct{}),

		syncPeriod: time.Duration(cfg.SyncPeriod) * time.Second,
	}

	clickRec, err := newClick.datastore.GetClicks(context.Background())
	if err != nil {
		return nil, errors.Trace(err)
	}
	newClick.clickFromStore, newClick.latestID = clickRec.Clicks, clickRec.ID

	go newClick.syncWorker()
	return newClick, nil
}
