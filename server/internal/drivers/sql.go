package drivers

import (
	"log/slog"

	"github.com/juju/errors"
	"github.com/samber/do"
	"github.com/xo/dburl"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/internal/tooling/log"
)

type SQLType string

const (
	SQLTypeSQLite SQLType = "sqlite"
)

type SQL interface {
	DB() *gorm.DB
}

type sql struct {
	DBType SQLType

	injector *do.Injector
	db       *gorm.DB
	logger   *slog.Logger
}

func (s *sql) Shutdown() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return errors.Trace(err)
	}
	return sqlDB.Close()
}

func (s *sql) DB() *gorm.DB {
	return s.db.Session(&gorm.Session{PrepareStmt: true})
}

func createDialector(connStr string) (gorm.Dialector, SQLType, error) {
	url, err := dburl.Parse(connStr)
	if err != nil {
		return nil, "", errors.Trace(err)
	}
	dsn := url.DSN
	switch url.Driver {
	case "sqlite3":
		return sqlite.Open(dsn), SQLTypeSQLite, nil
	default:
		return nil, "", errors.NotImplemented
	}
}

func DialSQL(injector *do.Injector) (SQL, error) {
	cfg := di.InvokeOrProvide(injector, config.LoadConfig)
	logger := di.InvokeOrProvide(injector, log.SetupLogger).New("sql")
	dialector, dbType, err := createDialector(cfg.DBSetup.DSN)
	if err != nil {
		return nil, errors.Trace(err)
	}

	const slowStatementReportingThreshold = 200
	db, err := gorm.Open(dialector, &gorm.Config{
		PrepareStmt: true,
		Logger: gormLogger.NewSlogLogger(logger, gormLogger.Config{
			SlowThreshold:             slowStatementReportingThreshold,
			Colorful:                  false,
			IgnoreRecordNotFoundError: true,
			ParameterizedQueries:      true,
		}),
	})
	if err != nil {
		return nil, errors.Trace(err)
	}

	return &sql{
		DBType:   dbType,
		injector: injector,
		db:       db,
		logger:   logger,
	}, nil
}
