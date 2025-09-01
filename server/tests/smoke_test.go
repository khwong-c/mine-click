package tests

import (
	"net/http"
	"testing"

	"github.com/samber/do"
	"github.com/stretchr/testify/suite"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/server"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/tests/fixtures"
)

const adminAPIKey = "admin"

type SmokeTestSuite struct {
	suite.Suite
	injector *do.Injector
	svr      *server.Server
}

func TestSmokeTests(t *testing.T) {
	suite.Run(t, new(SmokeTestSuite))
}

func (ts *SmokeTestSuite) SetupSuite() {
	ts.injector = di.CreateInjector(false)
	di.InvokeOrProvide(ts.injector, func(*do.Injector) (*config.Config, error) {
		cfg, err := fixtures.CreateDefaultConfig(false)
		if err != nil {
			return nil, err
		}
		// Patch the Config for testing.
		cfg.DBSetup.Migrate = true
		return cfg, nil
	})

	if !ts.NotPanics(func() {
		ts.svr = di.InvokeOrProvide(ts.injector, server.CreateServer)
	}) {
		ts.FailNow("Failed to create server")
	}
}

func (ts *SmokeTestSuite) TearDownSuite() {
	ts.NoError(ts.injector.Shutdown())
}

func (ts *SmokeTestSuite) TestHealthEndpoint() {
	ts.HTTPBodyContains(
		ts.svr.Handler.ServeHTTP,
		http.MethodGet,
		"/health",
		nil,
		".",
	)
}
