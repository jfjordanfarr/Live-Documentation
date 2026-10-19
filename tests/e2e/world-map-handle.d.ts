import type { WorldMapApi } from "../../packages/explorer/src/client/views/worldMap/controller";

declare global {
  interface Window {
    __worldMap?: WorldMapApi;
  }
}
