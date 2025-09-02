package config

import (
	"flag"
	"log/slog"
	"os"

	"github.com/cristalhq/aconfig"
	"github.com/cristalhq/aconfig/aconfigdotenv"
	"github.com/cristalhq/aconfig/aconfigyaml"
	"github.com/juju/errors"
	"github.com/samber/do"
)

type Env string

const (
	EnvDevelopment Env = "development"
	EnvProduction  Env = "production"
)

const (
	ServiceName = "mine-click"
)

type Config struct {
	Env      Env    `default:"development" usage:"Environment"`
	HTTPPort int    `default:"8086" usage:"Server port"`
	DebugKey string `default:"" usage:"Debug Key for more information"`
	DBSetup  struct {
		DSN     string `default:"sqlite3::memory:" usage:"Database SQL DSN"`
		Migrate bool   `default:"false" usage:"Migrate database from SQL queries."`
	}
	Logging struct {
		Level       slog.Level `default:"INFO" usage:"Logging level"`
		JSONLogging bool       `default:"false" usage:"Report log in JSON format"`
	}
}

func DefaultLoaderConfig() aconfig.Config {
	return aconfig.Config{
		SkipEnv:   false,
		SkipFlags: false,
		FileFlag:  "config",
		Files:     []string{"config.yaml"},
		FileDecoders: map[string]aconfig.FileDecoder{
			".yaml": aconfigyaml.New(),
			".env":  aconfigdotenv.New(),
		},
	}
}

func LoadConfig(*do.Injector) (*Config, error) {
	newCfg := Config{}
	loaderConfig := DefaultLoaderConfig()
	loader := aconfig.LoaderFor(&newCfg, loaderConfig)
	if err := loader.Load(); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			os.Exit(0)
		}
		return nil, errors.Trace(err)
	}
	return &newCfg, nil
}
