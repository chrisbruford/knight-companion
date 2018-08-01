export abstract class InaraEvent {
    abstract eventName: string;
    abstract eventData: object;
    eventTimestamp = new Date().toISOString();
}