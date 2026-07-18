import type { FlowEdge, FlowNode } from "@/features/interview-prep/components/diagrams/rough/FlowDiagram";

export type DiagramSpec = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  ariaLabel: string;
  columns?: number;
};

// Auto-laid-out FlowDiagram specs for every Feature 49 guide except the
// pilot (infinite-scroll-feed), which has its own hand-tuned
// InfiniteScrollArchitectureDiagram instead. Node labels/edges are pulled
// directly from each guide's own "High-Level Component Architecture"
// section — see systemDesignGuides.ts's consumer (the [slug] page) for how
// this maps to MDX's <ArchitectureDiagram />.
export const SYSTEM_DESIGN_DIAGRAMS: Record<string, DiagramSpec> = {
  "social-news-feed": {
    ariaLabel:
      "Architecture for a social news feed: the Pagination Sentinel and Real-Time Channel both feed the Feed Store, which drives the Virtualized Feed List; the Interaction Layer writes optimistic patches back into the Feed Store.",
    nodes: [
      { id: "sentinel", label: ["Pagination", "Sentinel"] },
      { id: "realtime", label: ["Real-Time", "Channel"] },
      { id: "store", label: ["Feed Store"] },
      { id: "list", label: ["Virtualized", "Feed List"] },
      { id: "interaction", label: ["Interaction", "Layer"] },
    ],
    edges: [
      ["sentinel", "store"],
      ["realtime", "store"],
      ["store", "list"],
      ["interaction", "store"],
    ],
  },
  "ecommerce-storefront": {
    ariaLabel:
      "Architecture for an e-commerce storefront: the Filter/Sort Panel drives the Product Grid, which feeds the Cart Store, which feeds the Checkout Stepper.",
    nodes: [
      { id: "filter", label: ["Filter/Sort", "Panel"] },
      { id: "grid", label: ["Product Grid"] },
      { id: "cart", label: ["Cart Store"] },
      { id: "checkout", label: ["Checkout", "Stepper"] },
    ],
    edges: [
      ["filter", "grid"],
      ["grid", "cart"],
      ["cart", "checkout"],
    ],
  },
  "photo-sharing-feed": {
    ariaLabel:
      "Architecture for a photo-sharing feed: the Feed/Grid List renders via the Media Loader and Carousel, both of which can open the Full-Screen Viewer.",
    nodes: [
      { id: "list", label: ["Feed/Grid List"] },
      { id: "loader", label: ["Media Loader"] },
      { id: "carousel", label: ["Carousel"] },
      { id: "viewer", label: ["Full-Screen", "Viewer"] },
    ],
    edges: [
      ["list", "loader"],
      ["list", "carousel"],
      ["carousel", "viewer"],
      ["loader", "viewer"],
    ],
  },
  "masonry-discovery-feed": {
    ariaLabel:
      "Architecture for a masonry discovery feed: the Pagination Sentinel and Resize Observer both feed the Column Packer, which drives the Masonry Grid.",
    nodes: [
      { id: "sentinel", label: ["Pagination", "Sentinel"] },
      { id: "resize", label: ["Resize", "Observer"] },
      { id: "packer", label: ["Column Packer"] },
      { id: "grid", label: ["Masonry Grid"] },
    ],
    edges: [
      ["sentinel", "packer"],
      ["resize", "packer"],
      ["packer", "grid"],
    ],
  },
  "search-autocomplete": {
    ariaLabel:
      "Architecture for a search autocomplete: Search Input feeds the Debouncer, which feeds the Request Guard, which feeds the Suggestion Dropdown.",
    nodes: [
      { id: "input", label: ["Search Input"] },
      { id: "debouncer", label: ["Debouncer"] },
      { id: "guard", label: ["Request Guard"] },
      { id: "dropdown", label: ["Suggestion", "Dropdown"] },
    ],
    edges: [
      ["input", "debouncer"],
      ["debouncer", "guard"],
      ["guard", "dropdown"],
    ],
  },
  "accessible-image-carousel": {
    ariaLabel:
      "Architecture for an image carousel: Navigation Controls and the Rotation Timer both drive the Carousel Container, which renders each Slide; the Position Indicator also connects to the Carousel Container.",
    nodes: [
      { id: "nav", label: ["Navigation", "Controls"] },
      { id: "timer", label: ["Rotation Timer"] },
      { id: "container", label: ["Carousel", "Container"] },
      { id: "slide", label: ["Slide"] },
      { id: "indicator", label: ["Position", "Indicator"] },
    ],
    edges: [
      ["nav", "container"],
      ["timer", "container"],
      ["container", "slide"],
      ["indicator", "container"],
    ],
  },
  "realtime-messaging-client": {
    ariaLabel:
      "Architecture for a real-time messaging client: the Connection Manager feeds the Message Store and Presence Tracker; the Message Store feeds the Read-Receipt Aggregator.",
    nodes: [
      { id: "conn", label: ["Connection", "Manager"] },
      { id: "store", label: ["Message Store"] },
      { id: "presence", label: ["Presence Tracker"] },
      { id: "receipts", label: ["Read-Receipt", "Aggregator"] },
    ],
    edges: [
      ["conn", "store"],
      ["conn", "presence"],
      ["store", "receipts"],
    ],
  },
  "multiplayer-document-editor": {
    ariaLabel:
      "Architecture for a multiplayer document editor: the Local Document Model feeds the Operation Queue, which feeds the Sync/Merge Layer, which writes back to the Local Document Model; the Presence Layer connects independently.",
    nodes: [
      { id: "model", label: ["Local Document", "Model"] },
      { id: "queue", label: ["Operation Queue"] },
      { id: "sync", label: ["Sync/Merge", "Layer"] },
      { id: "presence", label: ["Presence Layer"] },
    ],
    edges: [
      ["model", "queue"],
      ["queue", "sync"],
      ["sync", "model"],
      ["presence", "model"],
    ],
  },
  "collaborative-spreadsheet-engine": {
    ariaLabel:
      "Architecture for a collaborative spreadsheet: the Sync Layer feeds the Cell Store, which feeds the Dependency Graph, which feeds the Recalculation Engine, which writes back to the Cell Store; the Cell Store also feeds the Virtualized Grid Renderer.",
    nodes: [
      { id: "sync", label: ["Sync Layer"] },
      { id: "cells", label: ["Cell Store"] },
      { id: "graph", label: ["Dependency", "Graph"] },
      { id: "recalc", label: ["Recalculation", "Engine"] },
      { id: "renderer", label: ["Virtualized Grid", "Renderer"] },
    ],
    edges: [
      ["sync", "cells"],
      ["cells", "graph"],
      ["graph", "recalc"],
      ["recalc", "cells"],
      ["cells", "renderer"],
    ],
  },
  "collaborative-canvas-design-tool": {
    ariaLabel:
      "Architecture for a collaborative canvas design tool: the Sync Layer and Hit-Testing Layer both connect to the Scene Graph, which feeds the Renderer; the Presence Layer also connects to the Scene Graph.",
    nodes: [
      { id: "sync", label: ["Sync Layer"] },
      { id: "scene", label: ["Scene Graph"] },
      { id: "renderer", label: ["Renderer"] },
      { id: "hittest", label: ["Hit-Testing", "Layer"] },
      { id: "presence", label: ["Presence Layer"] },
    ],
    edges: [
      ["sync", "scene"],
      ["scene", "renderer"],
      ["hittest", "scene"],
      ["presence", "scene"],
    ],
  },
  "browser-video-conferencing": {
    ariaLabel:
      "Architecture for a browser video conferencing app: the Signaling Client feeds the Media Connection Manager, which feeds the Track Renderer; the Bandwidth/Quality Controller also connects to the Media Connection Manager.",
    nodes: [
      { id: "signaling", label: ["Signaling Client"] },
      { id: "media", label: ["Media Connection", "Manager"] },
      { id: "renderer", label: ["Track Renderer"] },
      { id: "bandwidth", label: ["Bandwidth/Quality", "Controller"] },
    ],
    edges: [
      ["signaling", "media"],
      ["media", "renderer"],
      ["bandwidth", "media"],
    ],
  },
  "realtime-task-tracker": {
    ariaLabel:
      "Architecture for a real-time task tracker: the Object Graph feeds the Mutation Queue, which feeds the Sync Engine, which writes back to the Object Graph; the Object Graph also feeds the Reactive View Layer.",
    nodes: [
      { id: "graph", label: ["Object Graph"] },
      { id: "queue", label: ["Mutation Queue"] },
      { id: "sync", label: ["Sync Engine"] },
      { id: "view", label: ["Reactive View", "Layer"] },
    ],
    edges: [
      ["graph", "queue"],
      ["queue", "sync"],
      ["sync", "graph"],
      ["graph", "view"],
    ],
  },
  "rich-text-editor-engine": {
    ariaLabel:
      "Architecture for a rich text editor engine: the Input Interpreter feeds the Document Model, which feeds the Reconciler, Selection Manager, and History Stack.",
    nodes: [
      { id: "input", label: ["Input", "Interpreter"] },
      { id: "model", label: ["Document Model"] },
      { id: "reconciler", label: ["Reconciler"] },
      { id: "selection", label: ["Selection", "Manager"] },
      { id: "history", label: ["History Stack"] },
    ],
    edges: [
      ["input", "model"],
      ["model", "reconciler"],
      ["model", "selection"],
      ["model", "history"],
    ],
  },
  "video-streaming-player": {
    ariaLabel:
      "Architecture for a video streaming player: the Manifest Parser and Bandwidth Estimator both feed the ABR Controller, which feeds the Segment Fetcher/Buffer, which feeds the Playback Controller.",
    nodes: [
      { id: "manifest", label: ["Manifest Parser"] },
      { id: "bandwidth", label: ["Bandwidth", "Estimator"] },
      { id: "abr", label: ["ABR Controller"] },
      { id: "fetcher", label: ["Segment Fetcher/", "Buffer"] },
      { id: "playback", label: ["Playback", "Controller"] },
    ],
    edges: [
      ["manifest", "abr"],
      ["bandwidth", "abr"],
      ["abr", "fetcher"],
      ["fetcher", "playback"],
    ],
  },
  "audio-streaming-player": {
    ariaLabel:
      "Architecture for an audio streaming player: the Queue Manager feeds the Prefetcher, which feeds the Chunk Buffer, which feeds the Playback Engine.",
    nodes: [
      { id: "queue", label: ["Queue Manager"] },
      { id: "prefetcher", label: ["Prefetcher"] },
      { id: "buffer", label: ["Chunk Buffer"] },
      { id: "playback", label: ["Playback Engine"] },
    ],
    edges: [
      ["queue", "prefetcher"],
      ["prefetcher", "buffer"],
      ["buffer", "playback"],
    ],
  },
  "travel-search-and-booking": {
    ariaLabel:
      "Architecture for a travel search and booking flow: the Filter Panel drives the Search Results List, which links into the Detail Page/Gallery, which feeds the Booking Stepper.",
    nodes: [
      { id: "filter", label: ["Filter Panel"] },
      { id: "results", label: ["Search Results", "List"] },
      { id: "detail", label: ["Detail Page/", "Gallery"] },
      { id: "booking", label: ["Booking Stepper"] },
    ],
    edges: [
      ["filter", "results"],
      ["results", "detail"],
      ["detail", "booking"],
    ],
  },
  "realtime-ridesharing-map": {
    ariaLabel:
      "Architecture for a real-time ridesharing map: the Location Socket feeds the Position Interpolator, which feeds the Map Renderer; the Ride State Machine also connects to the Map Renderer.",
    nodes: [
      { id: "socket", label: ["Location Socket"] },
      { id: "interpolator", label: ["Position", "Interpolator"] },
      { id: "renderer", label: ["Map Renderer"] },
      { id: "state", label: ["Ride State", "Machine"] },
    ],
    edges: [
      ["socket", "interpolator"],
      ["interpolator", "renderer"],
      ["state", "renderer"],
    ],
  },
  "offline-capable-email-client": {
    ariaLabel:
      "Architecture for an offline-capable email client: the Local Mail Store feeds the Action Queue, which feeds the Sync Engine, which writes back to the Local Mail Store; the Local Mail Store also feeds the Search Index.",
    nodes: [
      { id: "store", label: ["Local Mail Store"] },
      { id: "queue", label: ["Action Queue"] },
      { id: "sync", label: ["Sync Engine"] },
      { id: "search", label: ["Search Index"] },
    ],
    edges: [
      ["store", "queue"],
      ["queue", "sync"],
      ["sync", "store"],
      ["store", "search"],
    ],
  },
  "offline-first-sync-engine": {
    ariaLabel:
      "Architecture for an offline-first sync engine: the Local Database feeds the Mutation Log, which feeds the Sync Engine, which writes back to the Local Database; the Local Database also feeds the Reactive Query Layer.",
    nodes: [
      { id: "db", label: ["Local Database"] },
      { id: "log", label: ["Mutation Log"] },
      { id: "sync", label: ["Sync Engine"] },
      { id: "query", label: ["Reactive Query", "Layer"] },
    ],
    edges: [
      ["db", "log"],
      ["log", "sync"],
      ["sync", "db"],
      ["db", "query"],
    ],
  },
  "accessible-dropdown-menu": {
    ariaLabel:
      "Architecture for an accessible dropdown menu: the Trigger opens the Menu Panel, which contains the Menu Items; the Dismiss Handler closes the Menu Panel.",
    nodes: [
      { id: "trigger", label: ["Trigger"] },
      { id: "panel", label: ["Menu Panel"] },
      { id: "items", label: ["Menu Items"] },
      { id: "dismiss", label: ["Dismiss", "Handler"] },
    ],
    edges: [
      ["trigger", "panel"],
      ["panel", "items"],
      ["dismiss", "panel"],
    ],
  },
  "reusable-modal-dialog-system": {
    ariaLabel:
      "Architecture for a reusable modal system: the Modal Root/Portal, Focus Manager, and Backdrop/Inert Layer all connect to the Dialog Content.",
    nodes: [
      { id: "root", label: ["Modal Root/", "Portal"] },
      { id: "focus", label: ["Focus Manager"] },
      { id: "backdrop", label: ["Backdrop/Inert", "Layer"] },
      { id: "content", label: ["Dialog Content"] },
    ],
    edges: [
      ["root", "content"],
      ["focus", "content"],
      ["backdrop", "content"],
    ],
  },
  "star-rating-widget": {
    ariaLabel:
      "Architecture for a star rating widget: the Preview State Manager drives the Rating Group, which contains each Rating Star; the Rating Display is a separate, non-interactive rendering path.",
    nodes: [
      { id: "preview", label: ["Preview State", "Manager"] },
      { id: "group", label: ["Rating Group", "(input)"] },
      { id: "star", label: ["Rating Star"] },
      { id: "display", label: ["Rating Display", "(read-only)"] },
    ],
    edges: [
      ["preview", "group"],
      ["group", "star"],
    ],
  },
  "positioning-aware-tooltip-popover": {
    ariaLabel:
      "Architecture for a tooltip/popover system: the Positioning Engine serves both the Tooltip and the Popover, which both render through the shared Portal Layer.",
    nodes: [
      { id: "engine", label: ["Positioning", "Engine"] },
      { id: "tooltip", label: ["Tooltip"] },
      { id: "popover", label: ["Popover"] },
      { id: "portal", label: ["Portal Layer"] },
    ],
    edges: [
      ["engine", "tooltip"],
      ["engine", "popover"],
      ["tooltip", "portal"],
      ["popover", "portal"],
    ],
  },
  "scalable-design-system": {
    ariaLabel:
      "Architecture for a design system: the Token Layer feeds Primitive Components, which feed Composite Components, which feed the Documentation/Registry.",
    nodes: [
      { id: "tokens", label: ["Token Layer"] },
      { id: "primitives", label: ["Primitive", "Components"] },
      { id: "composites", label: ["Composite", "Components"] },
      { id: "docs", label: ["Documentation/", "Registry"] },
    ],
    edges: [
      ["tokens", "primitives"],
      ["primitives", "composites"],
      ["composites", "docs"],
    ],
  },
  "server-driven-ui-architecture": {
    ariaLabel:
      "Architecture for server-driven UI: the Screen Fetcher and Component Registry both feed the Renderer, which renders the registered Component Types.",
    nodes: [
      { id: "fetcher", label: ["Screen Fetcher"] },
      { id: "registry", label: ["Component", "Registry"] },
      { id: "renderer", label: ["Renderer"] },
      { id: "types", label: ["Component Types"] },
    ],
    edges: [
      ["fetcher", "renderer"],
      ["registry", "renderer"],
      ["renderer", "types"],
    ],
  },
  "i18n-l10n-architecture": {
    ariaLabel:
      "Architecture for internationalization: the Locale Provider feeds the Message Formatter and Direction-Aware Primitives; the Message Formatter feeds Translated Components.",
    nodes: [
      { id: "locale", label: ["Locale Provider"] },
      { id: "formatter", label: ["Message Formatter"] },
      { id: "components", label: ["Translated", "Components"] },
      { id: "direction", label: ["Direction-Aware", "Primitives"] },
    ],
    edges: [
      ["locale", "formatter"],
      ["formatter", "components"],
      ["locale", "direction"],
    ],
  },
  "ai-assisted-frontend-feature": {
    ariaLabel:
      "Architecture for an AI-assisted feature: the Stream Client feeds the Message Accumulator, which feeds the Incremental Renderer and the Component Registry.",
    nodes: [
      { id: "stream", label: ["Stream Client"] },
      { id: "accumulator", label: ["Message", "Accumulator"] },
      { id: "renderer", label: ["Incremental", "Renderer"] },
      { id: "registry", label: ["Component", "Registry"] },
    ],
    edges: [
      ["stream", "accumulator"],
      ["accumulator", "renderer"],
      ["accumulator", "registry"],
    ],
  },
};
