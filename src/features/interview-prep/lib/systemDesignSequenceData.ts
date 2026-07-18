import type {
  SequenceActor,
  SequenceMessage,
} from "@/features/interview-prep/components/diagrams/rough/SequenceDiagram";

export type SequenceSpec = {
  actors: SequenceActor[];
  messages: SequenceMessage[];
  ariaLabel: string;
};

// Time-ordered companion to systemDesignDiagramData.ts's static architecture
// diagrams — for the protocol-heavy guides where "who sends what, in what
// order" is the part worth seeing, not just the component graph. Every
// message here is pulled directly from that guide's own Data Contract Design
// / Deep Dives sections, not invented. Rendered via <SequenceDiagram />,
// wired the same per-slug way as SYSTEM_DESIGN_DIAGRAMS/<ArchitectureDiagram>.
export const SYSTEM_DESIGN_SEQUENCES: Record<string, SequenceSpec> = {
  "realtime-messaging-client": {
    ariaLabel:
      "Sequence: sender optimistically sends a message, the server acks it and relays it to the recipient, the recipient sends a read receipt back through the server, and on reconnect the sender backfills anything missed.",
    actors: [
      { id: "sender", label: "Sender Client" },
      { id: "server", label: "Server" },
      { id: "recipient", label: "Recipient Client" },
    ],
    messages: [
      { from: "sender", to: "server", label: "send (clientTempId)" },
      { from: "server", to: "sender", label: "message_ack (serverId)", dashed: true },
      { from: "server", to: "recipient", label: "message event" },
      { from: "recipient", to: "server", label: "read_receipt" },
      { from: "server", to: "sender", label: "read_receipt event", dashed: true },
      { from: "sender", to: "server", label: "reconnect: since=lastId" },
      { from: "server", to: "sender", label: "backfill missed messages", dashed: true },
    ],
  },

  "browser-video-conferencing": {
    ariaLabel:
      "Sequence: a client negotiates with the SFU via offer/answer and ICE candidates, then publishes its own track and receives a forwarded remote track once signaling completes.",
    actors: [
      { id: "client", label: "Client" },
      { id: "sfu", label: "SFU" },
    ],
    messages: [
      { from: "client", to: "sfu", label: "offer (sdp)" },
      { from: "sfu", to: "client", label: "answer (sdp)", dashed: true },
      { from: "client", to: "sfu", label: "ice_candidate" },
      { from: "sfu", to: "client", label: "ice_candidate", dashed: true },
      { from: "client", to: "sfu", label: "publish local track" },
      { from: "sfu", to: "client", label: "forward remote track", dashed: true },
    ],
  },

  "multiplayer-document-editor": {
    ariaLabel:
      "Sequence: two clients concurrently insert text against the same revision, and the server transforms each operation against the other before broadcasting the transformed result to both.",
    actors: [
      { id: "clientA", label: "Client A" },
      { id: "server", label: "Server (OT)" },
      { id: "clientB", label: "Client B" },
    ],
    messages: [
      { from: "clientA", to: "server", label: "insert @3 (rev 118)" },
      { from: "clientB", to: "server", label: "insert @5 (rev 118)" },
      { from: "server", to: "clientA", label: "transformed op from B", dashed: true },
      { from: "server", to: "clientB", label: "transformed op from A", dashed: true },
    ],
  },

  "collaborative-spreadsheet-engine": {
    ariaLabel:
      "Sequence: a client edits a cell and locally recomputes its dependents optimistically, the server relays the cell_update to another client, and that client recomputes its own dependents from the dependency graph.",
    actors: [
      { id: "clientA", label: "Editing Client" },
      { id: "server", label: "Sync Layer" },
      { id: "clientB", label: "Viewing Client" },
    ],
    messages: [
      { from: "clientA", to: "clientA", label: "recompute dependents" },
      { from: "clientA", to: "server", label: "cell_update B3=150 (rev88)" },
      { from: "server", to: "clientB", label: "cell_update event", dashed: true },
      { from: "clientB", to: "clientB", label: "recompute dependents" },
    ],
  },

  "collaborative-canvas-design-tool": {
    ariaLabel:
      "Sequence: two clients concurrently edit different properties of the same shape, the sync layer broadcasts each property-level last-writer-wins update to the other client, then one client inserts a new layer using a fractional index.",
    actors: [
      { id: "clientA", label: "Client A" },
      { id: "server", label: "Sync Layer" },
      { id: "clientB", label: "Client B" },
    ],
    messages: [
      { from: "clientA", to: "server", label: "update transform (LWW)" },
      { from: "clientB", to: "server", label: "update fill (LWW)" },
      { from: "server", to: "clientB", label: "broadcast transform update", dashed: true },
      { from: "server", to: "clientA", label: "broadcast fill update", dashed: true },
      { from: "clientA", to: "server", label: "insert layer, zIndex a0|g" },
      { from: "server", to: "clientB", label: "broadcast new layer", dashed: true },
    ],
  },

  "offline-first-sync-engine": {
    ariaLabel:
      "Sequence: a client writes locally and appends to its mutation log while offline, then on reconnect sends a batched sync request and applies the server's accepted mutations plus any remote changes.",
    actors: [
      { id: "client", label: "Client" },
      { id: "server", label: "Server" },
    ],
    messages: [
      { from: "client", to: "client", label: "write local + log mutation" },
      { from: "client", to: "server", label: "sync: batch (sinceRevision)" },
      { from: "server", to: "client", label: "accepted + remoteChanges", dashed: true },
      { from: "client", to: "client", label: "apply remote, resolve conflicts" },
    ],
  },

  "offline-capable-email-client": {
    ariaLabel:
      "Sequence: a client queues a send action durably while offline, replays it against the server once reconnected, and a second device later pulls down the resulting read-state change on its own next sync.",
    actors: [
      { id: "clientA", label: "Client A" },
      { id: "server", label: "Server" },
      { id: "clientB", label: "Client B" },
    ],
    messages: [
      { from: "clientA", to: "clientA", label: "queue send (durable)" },
      { from: "clientA", to: "server", label: "replay queued send" },
      { from: "server", to: "clientA", label: "ack (idempotent)", dashed: true },
      { from: "clientA", to: "server", label: "mark_read action" },
      { from: "clientB", to: "server", label: "sync (pull)" },
      { from: "server", to: "clientB", label: "remote changes: read-state", dashed: true },
    ],
  },

  "realtime-ridesharing-map": {
    ariaLabel:
      "Sequence: a driver's device streams location updates through the server to the rider's client, which interpolates the marker smoothly between each discrete update.",
    actors: [
      { id: "driver", label: "Driver Device" },
      { id: "server", label: "Server" },
      { id: "rider", label: "Rider Client" },
    ],
    messages: [
      { from: "driver", to: "server", label: "driver_location (t=0s)" },
      { from: "server", to: "rider", label: "driver_location event", dashed: true },
      { from: "rider", to: "rider", label: "interpolate marker" },
      { from: "driver", to: "server", label: "driver_location (t=3s)" },
      { from: "server", to: "rider", label: "driver_location event", dashed: true },
      { from: "rider", to: "rider", label: "interpolate marker" },
    ],
  },
};
