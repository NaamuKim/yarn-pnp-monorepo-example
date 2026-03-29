import React from 'react';
import { holes } from './holes';

export default function App() {
  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>ts5to6 codemod — unhandled breaking changes</h1>
      <p>
        Each entry below is a TypeScript 6 breaking change that <code>ts5to6 --fixBaseUrl / --fixRootDir</code> does
        not detect or fix. A more complete codemod could automate each fix.
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={th}>BC#</th>
            <th style={th}>TypeScript PR</th>
            <th style={th}>What breaks</th>
            <th style={th}>Automatable fix</th>
          </tr>
        </thead>
        <tbody>
          {holes.map((h) => (
            <tr key={h.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={td}>{h.id}</td>
              <td style={td}>
                <a href={`https://github.com/microsoft/TypeScript/pull/${h.pr}`} target="_blank" rel="noreferrer">
                  #{h.pr}
                </a>
              </td>
              <td style={td}>{h.breaks}</td>
              <td style={td}>{h.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #d1d5db' };
const td: React.CSSProperties = { padding: '8px 12px', verticalAlign: 'top' };
