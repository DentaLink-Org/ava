'use client';

import React from 'react';
import { DocumentBlock } from '../../types';

interface TableBlockProps {
  block: DocumentBlock;
  onUpdate: (updates: Partial<DocumentBlock>) => void;
  isEditing: boolean;
}

export function TableBlock({ block, onUpdate, isEditing }: TableBlockProps) {
  const table = block.content.table;
  const headers = table?.headers || ['Column 1', 'Column 2'];
  const rows = table?.rows || [['Cell 1', 'Cell 2']];
  
  return (
    <div style={{ padding: '0.5rem', overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '1px solid #e5e7eb'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {headers.map((header, index) => (
              <th key={index} style={{ 
                padding: '0.5rem', 
                textAlign: 'left',
                border: '1px solid #e5e7eb',
                fontWeight: '600'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{ 
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}