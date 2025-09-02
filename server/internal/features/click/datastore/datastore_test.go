package datastore

import (
	"testing"

	"github.com/google/uuid"
	"github.com/juju/errors"
	"github.com/samber/do"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/tests/fixtures"
)

func createCfg(_ *do.Injector) (*config.Config, error) {
	cfg, err := fixtures.CreateDefaultConfig(false)
	if err != nil {
		return nil, errors.Trace(err)
	}
	cfg.SQLTarget.Default = "sqlite3::memory:"
	cfg.DBSetup.Migrate = true
	return cfg, nil
}

type Record struct {
	ID      uuid.UUID `gorm:"type:text;primary_key;sort:desc"`
	Content JSONMap   `gorm:"type:json"`
}

func TestClickStore_Sanity(t *testing.T) {
	const key = "stone"
	inj := do.New()
	di.InvokeOrProvide(inj, createCfg)
	store := di.InvokeOrProvide(inj, NewClickStore)

	require.NoError(t, store.StoreClicks(t.Context(), JSONMap{
		key: 1,
	}))

	clicks1, err := store.GetClicks(t.Context())
	require.NoError(t, err)
	if assert.NotNil(t, clicks1) {
		assert.Equal(t, 1, len(clicks1.Clicks))
		assert.Equal(t, 1, clicks1.Clicks[key])
		assert.NotEmpty(t, clicks1.ID)
	}

	require.NoError(t, store.StoreClicks(t.Context(), JSONMap{
		key: 2,
	}))

	clicks2, err := store.GetClicks(t.Context())
	require.NoError(t, err)
	if assert.NotNil(t, clicks2) {
		assert.Equal(t, 1, len(clicks2.Clicks))
		assert.Equal(t, 2, clicks2.Clicks[key])
		assert.NotEmpty(t, clicks2.ID)
	}
	assert.NotEqual(t, clicks1.ID, clicks2.ID)
}
