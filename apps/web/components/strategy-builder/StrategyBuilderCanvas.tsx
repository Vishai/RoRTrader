'use client';

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Plus, Trash2, Settings, Link2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface StrategyNode {
  id: string;
  type: 'indicator' | 'condition' | 'action';
  name: string;
  position: { x: number; y: number };
  settings?: Record<string, any>;
  connections?: string[];
}

interface StrategyBuilderCanvasProps {
  nodes?: StrategyNode[];
  onNodeAdd?: (node: StrategyNode) => void;
  onNodeRemove?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<StrategyNode>) => void;
  onNodeConnect?: (fromId: string, toId: string) => void;
  className?: string;
}

export const StrategyBuilderCanvas: React.FC<StrategyBuilderCanvasProps> = ({
  nodes = [],
  onNodeAdd,
  onNodeRemove,
  onNodeUpdate,
  onNodeConnect,
  className,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (isConnecting && connectingFrom) {
      if (connectingFrom !== nodeId) {
        onNodeConnect?.(connectingFrom, nodeId);
      }
      setIsConnecting(false);
      setConnectingFrom(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const handleStartConnection = (nodeId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
    setSelectedNode(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const indicator = JSON.parse(data);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newNode: StrategyNode = {
        id: `node-${Date.now()}`,
        type: 'indicator',
        name: indicator.name,
        position: { x, y },
        settings: indicator.defaultSettings,
      };
      
      onNodeAdd?.(newNode);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const nodeColors = {
    indicator: 'bg-accent-primary/20 border-accent-primary/50 hover:border-accent-primary',
    condition: 'bg-accent-warning/20 border-accent-warning/50 hover:border-accent-warning',
    action: 'bg-accent-secondary/20 border-accent-secondary/50 hover:border-accent-secondary',
  };

  return (
    <div
      className={cn(
        'relative min-h-[600px] bg-background-primary border-2 border-dashed border-border-default rounded-lg',
        'overflow-hidden',
        isConnecting && 'cursor-crosshair',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Canvas Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Drop Zone Hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Plus className="w-12 h-12 text-text-tertiary mx-auto" />
            <p className="text-text-tertiary">
              Drag indicators here to start building your strategy
            </p>
          </div>
        </div>
      )}

      {/* Render Connections */}
      <svg className="absolute inset-0 pointer-events-none">
        {nodes.map(node => 
          node.connections?.map(targetId => {
            const targetNode = nodes.find(n => n.id === targetId);
            if (!targetNode) return null;
            
            return (
              <line
                key={`${node.id}-${targetId}`}
                x1={node.position.x + 100}
                y1={node.position.y + 40}
                x2={targetNode.position.x + 100}
                y2={targetNode.position.y + 40}
                stroke="currentColor"
                strokeWidth="2"
                className="text-accent-primary/50"
                strokeDasharray="5,5"
              />
            );
          })
        )}
      </svg>

      {/* Render Nodes */}
      {nodes.map(node => (
        <div
          key={node.id}
          className={cn(
            'absolute p-3 rounded-lg border-2 cursor-move transition-all',
            'min-w-[200px]',
            nodeColors[node.type],
            selectedNode === node.id && 'ring-2 ring-accent-primary',
            isConnecting && connectingFrom === node.id && 'animate-pulse'
          )}
          style={{
            left: node.position.x,
            top: node.position.y,
          }}
          onClick={() => handleNodeClick(node.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-text-primary">{node.name}</h4>
              {node.settings && Object.keys(node.settings).length > 0 && (
                <p className="text-xs text-text-tertiary mt-1">
                  {Object.entries(node.settings)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartConnection(node.id);
                }}
                className="p-1 rounded hover:bg-background-elevated"
                title="Connect to another node"
              >
                <Link2 className="w-4 h-4 text-text-secondary" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Open settings modal
                }}
                className="p-1 rounded hover:bg-background-elevated"
                title="Configure"
              >
                <Settings className="w-4 h-4 text-text-secondary" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeRemove?.(node.id);
                }}
                className="p-1 rounded hover:bg-background-elevated"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-accent-danger" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Connection Mode Indicator */}
      {isConnecting && (
        <div className="absolute top-4 left-4 bg-accent-primary text-background-primary px-3 py-1 rounded-full text-sm font-medium">
          Click another node to connect
        </div>
      )}
    </div>
  );
};

export default StrategyBuilderCanvas;
