package tests

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/juju/errors"
	"github.com/khwong-c/httptestclient"
	"github.com/samber/do"
	"github.com/stretchr/testify/suite"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/features/click"
	"github.com/khwong-c/mine-click/server/internal/features/click/datastore"
	"github.com/khwong-c/mine-click/server/internal/server"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/tests/fixtures"
)

func createCfg(_ *do.Injector) (*config.Config, error) {
	cfg, err := fixtures.CreateDefaultConfig(false)
	if err != nil {
		return nil, errors.Trace(err)
	}
	cfg.DBSetup.DSN = "sqlite3::memory:"
	cfg.DBSetup.Migrate = true
	return cfg, nil
}

type ClickTestSuite struct {
	suite.Suite
	injector   *do.Injector
	cfg        *config.Config
	clickStore datastore.ClickStore
	clickSvc   *click.Click
	server     *server.Server
}

func (s *ClickTestSuite) SetupSuite() {
	s.injector = do.New()
	s.cfg = di.InvokeOrProvide(s.injector, createCfg)
	s.server = di.InvokeOrProvide(s.injector, server.CreateServer)
	s.clickSvc = di.Invoke[*click.Click](s.injector)
	s.clickStore = di.Invoke[datastore.ClickStore](s.injector)
}

func TestClickTestSuite(t *testing.T) {
	suite.Run(t, new(ClickTestSuite))
}

func (s *ClickTestSuite) TestClick_Persistent() {
	const clickCount = 10
	validClickType := click.PermittedClickTypeSlice[0]
	ctx := s.T().Context()
	client := httptestclient.New(s.server.Handler)
	for i := 0; i < clickCount; i++ {
		req := s.mustMakeReq(http.NewRequestWithContext(ctx, http.MethodPost, "/click/"+validClickType, nil))
		resp, err := client.Do(req)
		resp.Body.Close()
		s.NoError(err)
		s.Equal(resp.StatusCode, http.StatusOK)
	}
	req := s.mustMakeReq(http.NewRequestWithContext(ctx, http.MethodGet, "/clicks", nil))
	if resp, err := client.Do(req); s.NoError(err) && s.Equal(resp.StatusCode, http.StatusOK) {
		type clickResp struct {
			Clicks map[string]int `json:"clicks"`
		}
		defer resp.Body.Close()
		result := clickResp{}
		if s.NoError(json.NewDecoder(resp.Body).Decode(&result)) {
			s.Equal(clickCount, result.Clicks[validClickType])
		}
	}

	s.Require().NoError(s.clickSvc.Shutdown())

	if clicks, err := s.clickStore.GetClicks(ctx); s.NoError(err) {
		s.T().Log(clicks)
		s.NotEmpty(clicks)
		s.Equal(clickCount, clicks.Clicks[validClickType])
	}
}

func (s *ClickTestSuite) mustMakeReq(req *http.Request, err error) *http.Request {
	s.Require().NoError(err)
	return req
}
