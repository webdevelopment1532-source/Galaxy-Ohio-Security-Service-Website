export type OhioEventType = 'customer.upsert' | 'sale.upsert' | 'service.upsert' | 'payment.upsert';
export type OhioContractSchemaVersion = 'v1' | 'v2';

export interface OhioIntegrationEventContract {
  event_id: string;
  event_type: OhioEventType;
  occurred_at: string;
  event_version?: string;
  trace_id?: string;
  payload: Record<string, unknown>;
}

interface OhioBrokerEnvelopeContractBase<TEvent extends OhioIntegrationEventContract = OhioIntegrationEventContract> {
  producer: 'ohio-backend';
  topic: string;
  key: string;
  idempotency_key: string;
  event_version: string;
  trace_id: string;
  event: TEvent;
}

export interface OhioBrokerEnvelopeContractV1<TEvent extends OhioIntegrationEventContract = OhioIntegrationEventContract>
  extends OhioBrokerEnvelopeContractBase<TEvent> {
  schema_version: 'v1';
}

export interface OhioBrokerEnvelopeContractV2<TEvent extends OhioIntegrationEventContract = OhioIntegrationEventContract>
  extends OhioBrokerEnvelopeContractBase<TEvent> {
  schema_version: 'v2';
}

export type OhioBrokerEnvelopeContract<TEvent extends OhioIntegrationEventContract = OhioIntegrationEventContract> =
  | OhioBrokerEnvelopeContractV1<TEvent>
  | OhioBrokerEnvelopeContractV2<TEvent>;

// Non-generic aliases used as stable schema-generation roots.
export type OhioBrokerEnvelopeContractV1Schema = OhioBrokerEnvelopeContractV1<OhioIntegrationEventContract>;
export type OhioBrokerEnvelopeContractV2Schema = OhioBrokerEnvelopeContractV2<OhioIntegrationEventContract>;
