package datastore

import (
	"context"

	"github.com/google/uuid"
	"github.com/juju/errors"
	"github.com/samber/do"
	"gorm.io/gorm"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/drivers"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
)

type ClickStore interface {
	GetClicks(ctx context.Context) (*ClickRecord, error)
	StoreClicks(ctx context.Context, clicks JSONMap) error
}

type clickStore struct {
	db *gorm.DB
}

func (c *clickStore) GetClicks(ctx context.Context) (*ClickRecord, error) {
	var clicks ClickRecord
	if err := c.db.WithContext(ctx).Model(&ClickRecord{}).
		Order("id desc").Find(&clicks).Limit(1).Error; err != nil {
		return nil, errors.Trace(err)
	}
	return &clicks, nil
}

func (c *clickStore) StoreClicks(ctx context.Context, clicks JSONMap) error {
	newRec := ClickRecord{
		ID:     uuid.Must(uuid.NewV7()),
		Clicks: clicks,
	}
	if err := c.db.WithContext(ctx).Save(&newRec).Error; err != nil {
		return errors.Trace(err)
	}
	return nil
}

func NewClickStore(injector *do.Injector) (ClickStore, error) {
	cfg := di.InvokeOrProvide(injector, config.LoadConfig)
	newStore := &clickStore{
		db: di.InvokeOrProvide(injector, drivers.DialSQL).DB().Session(&gorm.Session{
			PrepareStmt: true,
		}),
	}
	if cfg.DBSetup.Migrate {
		if err := newStore.db.AutoMigrate(&ClickRecord{}); err != nil {
			return nil, errors.Trace(err)
		}
	}

	lastClicks, err := newStore.GetClicks(context.Background())
	if err != nil {
		return nil, errors.Trace(err)
	}
	if lastClicks.ID == uuid.Nil {
		if err := newStore.StoreClicks(context.Background(), JSONMap{}); err != nil {
			return nil, errors.Trace(err)
		}
	}

	return newStore, nil
}
