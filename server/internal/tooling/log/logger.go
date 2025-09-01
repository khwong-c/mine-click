package log

import (
	"log/slog"
	"os"

	"github.com/dotse/slug"
	"github.com/samber/do"
	slogmulti "github.com/samber/slog-multi"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
)

// Logger implements Shutdownable interface, allowing for graceful shutdown.
type Logger struct {
	Logger   *slog.Logger
	injector *do.Injector
}

func (l *Logger) Shutdown() error {
	return nil
}

func (l *Logger) New(pkg string) *slog.Logger {
	return l.Logger.With("package", pkg)
}

func SetupLogger(injector *do.Injector) (*Logger, error) {
	cfg := di.InvokeOrProvide(injector, config.LoadConfig)
	handlers := make([]slog.Handler, 0)
	if cfg.Logging.JSONLogging {
		handlers = append(handlers, slog.NewJSONHandler(
			os.Stdout,
			&slog.HandlerOptions{
				Level: cfg.Logging.Level,
			},
		))
	}
	if cfg.Env == config.EnvDevelopment {
		handlers = append(handlers, slug.NewHandler(slug.HandlerOptions{
			HandlerOptions: slog.HandlerOptions{
				Level: cfg.Logging.Level,
			},
		}, os.Stdout))
	}

	l := slog.New(slogmulti.Fanout(handlers...))
	slog.SetDefault(l)

	return &Logger{
		Logger:   l,
		injector: injector,
	}, nil
}
