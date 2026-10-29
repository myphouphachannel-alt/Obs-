/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface OBSConnectionConfig {
  ip: string;
  port: number;
  password?: string;
  rememberSettings?: boolean;
}

export interface OBSScene {
  sceneName: string;
  sceneIndex: number;
}

export interface OBSSceneItem {
  sceneItemId: number;
  sourceName: string;
  sourceType: string;
  sceneItemEnabled: boolean;
  sceneItemIndex: number;
}

export interface OBSAudioInput {
  inputName: string;
  inputKind: string;
  unversionedInputKind: string;
  muted: boolean;
  volumeMul: number; // 0.0 - 1.0
  volumeDb: number;
}

export interface OBSStreamStatus {
  active: boolean;
  reconnecting: boolean;
  timecode: string;
  duration: number; // in milliseconds
  bytes: number;
  kbitsPerSec?: number;
  skippedFrames?: number;
  totalFrames?: number;
}

export interface OBSRecordStatus {
  active: boolean;
  paused: boolean;
  timecode: string;
  duration: number; // in milliseconds
  bytes: number;
}

export interface OBSMediaInput {
  inputName: string;
  inputKind: string;
  mediaState?: 'OBS_MEDIA_STATE_NONE' | 'OBS_MEDIA_STATE_STARTING' | 'OBS_MEDIA_STATE_PLAYING' | 'OBS_MEDIA_STATE_PAUSED' | 'OBS_MEDIA_STATE_STOPPED' | 'OBS_MEDIA_STATE_ENDED' | 'OBS_MEDIA_STATE_ERROR';
  mediaDuration?: number;
  mediaCursor?: number;
}

export interface CameraPadConfig {
  id: string;
  label: string;
  type: 'scene' | 'source';
  targetSceneName: string;
  targetSourceName?: string;
  color?: string;
}

export interface RemoteSettings {
  screenshotInterval: number; // 0 for off, or milliseconds (1000, 2000, 5000)
  enableHaptics: boolean;
  confirmStreamStop: boolean;
  confirmRecordStop: boolean;
  cameraPads: CameraPadConfig[];
}
