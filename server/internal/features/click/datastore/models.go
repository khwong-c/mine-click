package datastore

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/juju/errors"
)

type JSONMap map[string]int

// Scan scans value into Jsonb, implements sql.Scanner interface
func (j *JSONMap) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("Failed to retrieve JSON value:", value))
	}

	result := JSONMap{}
	err := json.Unmarshal(bytes, &result)
	*j = result
	return errors.Trace(err)
}

// Value returns json value, implement driver.Valuer interface
func (j JSONMap) Value() (driver.Value, error) {
	if j == nil || len(j) == 0 {
		return []byte("{}"), nil
	}
	return json.Marshal(j)
}

type ClickRecord struct {
	ID     uuid.UUID `gorm:"type:text;primary_key"`
	Clicks JSONMap   `gorm:"type:json"`
}
