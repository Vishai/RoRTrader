export enum WebhookAction {
  BUY = 'buy',
  SELL = 'sell',
  CLOSE = 'close',
}

export class WebhookSignalDto {
  action: WebhookAction;
  symbol: string;
  quantity?: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  orderId?: string;
  message?: string;
  // Optional indicator values for logging
  indicators?: Record<string, any>;
}
