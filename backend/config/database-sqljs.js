import initSqlJs from 'sql.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wasmPath = join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');

const SQL = await initSqlJs({
  locateFile: () => wasmPath,
  wasmBinary: fs.readFileSync(wasmPath),
});

function bindParams(stmt, params) {
  if (params.length === 0) {
    return;
  }

  if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
    stmt.bind(params[0]);
    return;
  }

  stmt.bind(params);
}

export function createSqlJsAdapter(dbPath) {
  const dir = dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let raw;
  if (fs.existsSync(dbPath)) {
    raw = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    raw = new SQL.Database();
  }

  function persist() {
    const buffer = raw.export();
    fs.writeFileSync(dbPath, Buffer.from(buffer));
  }

  function prepare(sql) {
    return {
      get(...params) {
        const stmt = raw.prepare(sql);
        try {
          bindParams(stmt, params);
          if (!stmt.step()) {
            return undefined;
          }
          return stmt.getAsObject();
        } finally {
          stmt.free();
        }
      },
      all(...params) {
        const stmt = raw.prepare(sql);
        const rows = [];
        try {
          bindParams(stmt, params);
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          return rows;
        } finally {
          stmt.free();
        }
      },
      run(...params) {
        raw.run(sql, params);
        const rowidResult = raw.exec('SELECT last_insert_rowid() AS id');
        const lastInsertRowid = rowidResult[0]?.values[0]?.[0] ?? 0;
        const changes = raw.getRowsModified();
        persist();
        return { lastInsertRowid, changes };
      },
    };
  }

  return {
    prepare,
    exec(sql) {
      raw.run(sql);
      persist();
    },
    pragma(setting) {
      if (setting === 'foreign_keys = ON') {
        raw.run('PRAGMA foreign_keys = ON');
      }
    },
    close() {},
  };
}
