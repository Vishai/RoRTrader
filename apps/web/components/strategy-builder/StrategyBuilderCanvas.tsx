'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Plus, Trash2, Settings, Link2, Save, AlertCircle, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useStrategyBuilder, useCreateStrategy, useUpdateStrategy } from '@/hooks/useStrategy';
import { useIndicators } from '@/hooks/useIndicators';
import toast from 'react-hot-toast';

interface StrategyNode {
  id: string;
  type: 'indicator' | 'condition' | 'action';
  indicatorId?: string;
  name: string;
  position: { x: number; y: number };
  settings?: Record<string, any>;
  connections?: string[];
}

interface StrategyBuilderCanvasProps {
  botId?: string;
  existingStrategyId?: string;
  onSave?: (strategyId: string) => void;
  className?: string;
}

export const StrategyBuilderCanvas: React.FC<StrategyBuilderCanvasProps> = ({
  botId,
  existingStrategyId,
  onSave,
  className,
}) => {
  const [nodes, setNodes] = useState<StrategyNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Hooks for API integration
  const { data: availableIndicators } = useIndicators();
  const {
    strategy,
    validationErrors,
    updateStrategy,
    addIndicator,
    addRule,
    validate,
  } = useStrategyBuilder();

  const createStrategy = useCreateStrategy();
  const updateExistingStrategy = useUpdateStrategy();

  // Load existing strategy if provided
  // TODO: Load existing strategy data

  // Handle node addition
  const handleNodeAdd = useCallback((type: StrategyNode['type']) => {
    const newNode: StrategyNode = {
      id: `node_${Date.now()}`,
      type,
      name: type === 'indicator' ? 'Select Indicator' : 
            type === 'condition' ? 'New Condition' : 'New Action',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      connections: [],
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  }, []);

  // Handle node removal
  const handleNodeRemove = useCallback((nodeId: string) => {
    setNodes(prev => {
      // Remove connections to this node
      const updated = prev.map(node => ({
        ...node,
        connections: node.connections?.filter(id => id !== nodeId) || [],
      }));
      // Remove the node itself
      return updated.filter(node => node.id !== nodeId);
    });
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Handle node connection
  const handleNodeConnect = useCallback((fromId: string, toId: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === fromId) {
        const connections = node.connections || [];
        if (!connections.includes(toId)) {
          return { ...node, connections: [...connections, toId] };
        }
      }
      return node;
    }));
  }, []);

  // Handle node drag
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsDragging(nodeId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const canvas = document.getElementById('strategy-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(prev => prev.map(node => 
      node.id === isDragging 
        ? { ...node, position: { x, y } }
        : node
    ));
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Convert nodes to strategy format
  const convertNodesToStrategy = useCallback(() => {
    const indicatorNodes = nodes.filter(n => n.type === 'indicator');
    const conditionNodes = nodes.filter(n => n.type === 'condition');
    const actionNodes = nodes.filter(n => n.type === 'action');

    // Update strategy with nodes
    updateStrategy({
      name: strategy.name || 'Visual Strategy',
      description: strategy.description || 'Created with Strategy Builder',
      type: 'custom',
      indicators: indicatorNodes.map(node => ({
        indicator: node.indicatorId || 'rsi',
        parameters: node.settings || {},
        weight: 1 / indicatorNodes.length,
        enabled: true,
      })),
      rules: conditionNodes.map((node, index) => ({
        type: 'entry' as const,
        conditions: [{
          indicator: node.indicatorId || 'rsi',
          comparison: 'lt' as const,
          value: 30,
        }],
        action: {
          type: 'buy' as const,
        },
        enabled: true,
      })),
    });
  }, [nodes, strategy, updateStrategy]);

  // Save strategy
  const handleSave = async () => {
    convertNodesToStrategy();
    
    if (!validate()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      let savedStrategy;
      
      if (existingStrategyId) {
        savedStrategy = await updateExistingStrategy.mutateAsync({
          id: existingStrategyId,
          updates: { ...strategy, botId },
        });
      } else {
        savedStrategy = await createStrategy.mutateAsync({
          ...strategy as any,
          botId,
        });
      }

      toast.success('Strategy saved successfully!');
      onSave?.(savedStrategy.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save strategy');
    }
  };

  // Draw connections
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(fromNode => {
      fromNode.connections?.forEach(toId => {
        const toNode = nodes.find(n => n.id === toId);
        if (!toNode) return;

        const key = `${fromNode.id}-${toId}`;
        connections.push(
          <line
            key={key}
            x1={fromNode.position.x + 100}
            y1={fromNode.position.y + 40}
            x2={toNode.position.x + 100}
            y2={toNode.position.y + 40}
            stroke="#00D4FF"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      });
    });

    return connections;
  };

  const nodeColors = {
    indicator: 'border-accent-primary bg-accent-primary/10',
    condition: 'border-accent-warning bg-accent-warning/10',
    action: 'border-accent-secondary bg-accent-secondary/10',
  };

  return (
    <div className={cn('relative', className)}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleNodeAdd('indicator')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Indicator
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleNodeAdd('condition')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Condition
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleNodeAdd('action')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Action
        </Button>
        <Button
          variant={isConnecting ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setIsConnecting(!isConnecting);
            setConnectingFrom(null);
          }}
        >
          <Link2 className="w-4 h-4 mr-1" />
          Connect
        </Button>
      </div>

      {/* Save button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={createStrategy.isPending || updateExistingStrategy.isPending}
        >
          <Save className="w-4 h-4 mr-1" />
          Save Strategy
        </Button>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="absolute top-16 right-4 z-10 max-w-xs">
          <div className="bg-accent-danger/10 border border-accent-danger/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-accent-danger mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-accent-danger">Validation Errors</p>
                {validationErrors.map((error, i) => (
                  <p key={i} className="text-xs text-text-secondary">{error}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        id="strategy-canvas"
        className="relative h-[600px] bg-background-secondary rounded-lg border-2 border-dashed border-border-default overflow-hidden"
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#00D4FF"
              />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={cn(
              'absolute w-48 cursor-move select-none',
              selectedNode === node.id && 'ring-2 ring-accent-primary',
              isConnecting && connectingFrom === node.id && 'ring-2 ring-accent-warning'
            )}
            style={{
              left: node.position.x,
              top: node.position.y,
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => {
              if (isConnecting) {
                if (!connectingFrom) {
                  setConnectingFrom(node.id);
                } else if (connectingFrom !== node.id) {
                  handleNodeConnect(connectingFrom, node.id);
                  setIsConnecting(false);
                  setConnectingFrom(null);
                }
              } else {
                setSelectedNode(node.id);
              }
            }}
          >
            <Card className={cn('p-3 border-2', nodeColors[node.type])}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase opacity-70">
                  {node.type}
                </span>
                <div className="flex gap-1">
                  <button
                    className="p-1 hover:bg-background-elevated rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Open settings modal
                    }}
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                  <button
                    className="p-1 hover:bg-background-elevated rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeRemove(node.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-accent-danger" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium">{node.name}</p>
              {node.settings && Object.keys(node.settings).length > 0 && (
                <p className="text-xs text-text-tertiary mt-1">
                  {Object.entries(node.settings).map(([k, v]) => `${k}: ${v}`).join(', ')}
                </p>
              )}
            </Card>
          </div>
        ))}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-tertiary mb-2">
                Start building your strategy by adding nodes
              </p>
              <p className="text-text-tertiary text-sm">
                Use the toolbar above to add indicators, conditions, and actions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyBuilderCanvas;
