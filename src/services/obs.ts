/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OBSWebSocket, EventSubscription } from 'obs-websocket-js';
import {
  OBSScene,
  OBSSceneItem,
  OBSAudioInput,
  OBSStreamStatus,
  OBSRecordStatus,
  OBSMediaInput,
} from '../types/obs';

export type EventCallback = (data: any) => void;

class OBSConnectionService {
  private obs: OBSWebSocket | null = null;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.obs = new OBSWebSocket();
    this.setupInternalListeners();
  }

  private setupInternalListeners() {
    if (!this.obs) return;

    this.obs.on('ConnectionClosed', (error) => {
      this.isConnected = false;
      this.isConnecting = false;
      this.emit('ConnectionClosed', error);
    });

    this.obs.on('ConnectionError', (error) => {
      this.isConnected = false;
      this.isConnecting = false;
      this.emit('ConnectionError', error);
    });

    this.obs.on('CurrentProgramSceneChanged', (data) => {
      this.emit('CurrentProgramSceneChanged', data);
    });

    this.obs.on('CurrentPreviewSceneChanged', (data) => {
      this.emit('CurrentPreviewSceneChanged', data);
    });

    this.obs.on('SceneListChanged', (data) => {
      this.emit('SceneListChanged', data);
    });

    this.obs.on('SceneItemEnableStateChanged', (data) => {
      this.emit('SceneItemEnableStateChanged', data);
    });

    this.obs.on('InputMuteStateChanged', (data) => {
      this.emit('InputMuteStateChanged', data);
    });

    this.obs.on('InputVolumeChanged', (data) => {
      this.emit('InputVolumeChanged', data);
    });

    this.obs.on('StreamStateChanged', (data) => {
      this.emit('StreamStateChanged', data);
    });

    this.obs.on('RecordStateChanged', (data) => {
      this.emit('RecordStateChanged', data);
    });

    this.obs.on('StudioModeStateChanged', (data) => {
      this.emit('StudioModeStateChanged', data);
    });

    this.obs.on('MediaInputActionTriggered', (data) => {
      this.emit('MediaInputActionTriggered', data);
    });
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in OBS event handler for ${event}:`, err);
        }
      });
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getIsConnecting(): boolean {
    return this.isConnecting;
  }

  public async connect(ip: string, port: number, password?: string): Promise<{ version: string; obsWebSocketVersion: string }> {
    if (this.isConnected) {
      await this.disconnect();
    }

    this.isConnecting = true;
    let url: string;
    
    // Normalize IP/Host: allow wss://, ws:// or raw host/IP
    const clean = ip.trim();
    let protocol = 'ws';
    let cleanHost = clean;

    if (clean.startsWith('wss://')) {
      protocol = 'wss';
      cleanHost = clean.replace(/^wss:\/\//, '');
    } else if (clean.startsWith('ws://')) {
      protocol = 'ws';
      cleanHost = clean.replace(/^ws:\/\//, '');
    } else {
      cleanHost = clean.replace(/^https?:\/\//, '');
    }

    const isDomain = !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost) && cleanHost !== 'localhost';

    // If host already contains port, don't append port again
    if (cleanHost.includes(':')) {
      url = `${protocol}://${cleanHost}`;
    } else if (protocol === 'wss' && isDomain) {
      // Tunnel domain (e.g. ngrok / cloudflare) uses default HTTPS/WSS port 443
      url = `${protocol}://${cleanHost}`;
    } else {
      url = `${protocol}://${cleanHost}:${port}`;
    }

    try {
      // Subscribe to General, Config, Scenes, Inputs, Transitions, Outputs, SceneItems, MediaInputs
      const connectPromise = this.obs!.connect(url, password || undefined, {
        eventSubscriptions:
          EventSubscription.General |
          EventSubscription.Config |
          EventSubscription.Scenes |
          EventSubscription.Inputs |
          EventSubscription.Transitions |
          EventSubscription.Outputs |
          EventSubscription.SceneItems |
          EventSubscription.MediaInputs,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`หมดเวลาเชื่อมต่อ (10s): คอมพิวเตอร์ไม่ตอบรับที่พอร์ต ${port} (ตรวจดูว่าเปิด OBS และปลดล็อค Windows Firewall พอร์ต 4455 หรือยัง)`));
        }, 10000);
      });

      const response = await Promise.race([connectPromise, timeoutPromise]) as any;

      this.isConnected = true;
      this.isConnecting = false;
      this.emit('ConnectionSuccess', response);

      const versionData = await this.obs!.call('GetVersion');
      return {
        version: versionData.obsVersion,
        obsWebSocketVersion: versionData.obsWebSocketVersion,
      };
    } catch (err: any) {
      try {
        await this.obs!.disconnect();
      } catch {}
      this.isConnected = false;
      this.isConnecting = false;
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.obs && this.isConnected) {
        await this.obs.disconnect();
      }
    } catch (err) {
      console.warn('Error during disconnect:', err);
    } finally {
      this.isConnected = false;
      this.isConnecting = false;
      this.emit('ConnectionClosed', { intentional: true });
    }
  }

  public async getScenes(): Promise<{
    scenes: OBSScene[];
    currentProgramSceneName: string;
    currentPreviewSceneName: string | null;
  }> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');

    const data = await this.obs.call('GetSceneList');
    const scenes: OBSScene[] = (data.scenes as any[]).map((s: any) => ({
      sceneName: s.sceneName,
      sceneIndex: s.sceneIndex,
    }));

    return {
      scenes,
      currentProgramSceneName: data.currentProgramSceneName || '',
      currentPreviewSceneName: data.currentPreviewSceneName || null,
    };
  }

  public async setCurrentProgramScene(sceneName: string): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('SetCurrentProgramScene', { sceneName });
  }

  public async setCurrentPreviewScene(sceneName: string): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('SetCurrentPreviewScene', { sceneName });
  }

  public async getStudioModeEnabled(): Promise<boolean> {
    if (!this.isConnected || !this.obs) return false;
    try {
      const data = await this.obs.call('GetStudioModeEnabled');
      return data.studioModeEnabled;
    } catch {
      return false;
    }
  }

  public async setStudioModeEnabled(studioModeEnabled: boolean): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('SetStudioModeEnabled', { studioModeEnabled });
  }

  public async triggerStudioModeTransition(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('TriggerStudioModeTransition');
  }

  public async getSceneItems(sceneName: string): Promise<OBSSceneItem[]> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const data = await this.obs.call('GetSceneItemList', { sceneName });
    return (data.sceneItems as any[]).map((item: any) => ({
      sceneItemId: item.sceneItemId,
      sourceName: item.sourceName,
      sourceType: item.inputKind || item.sourceType || 'source',
      sceneItemEnabled: item.sceneItemEnabled,
      sceneItemIndex: item.sceneItemIndex,
    }));
  }

  public async setSceneItemEnabled(sceneName: string, sceneItemId: number, sceneItemEnabled: boolean): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('SetSceneItemEnabled', {
      sceneName,
      sceneItemId,
      sceneItemEnabled,
    });
  }

  public async getAudioInputs(): Promise<OBSAudioInput[]> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const data = await this.obs.call('GetInputList');
    const inputs: OBSAudioInput[] = [];

    for (const input of data.inputs as any[]) {
      try {
        const [muteRes, volRes] = await Promise.all([
          this.obs.call('GetInputMute', { inputName: input.inputName }).catch(() => null),
          this.obs.call('GetInputVolume', { inputName: input.inputName }).catch(() => null),
        ]);

        if (muteRes !== null && volRes !== null) {
          inputs.push({
            inputName: input.inputName,
            inputKind: input.inputKind,
            unversionedInputKind: input.unversionedInputKind || input.inputKind,
            muted: muteRes.inputMuted,
            volumeMul: volRes.inputVolumeMul ?? 1.0,
            volumeDb: volRes.inputVolumeDb ?? 0,
          });
        }
      } catch (e) {
        // Source does not have audio properties; skip it
      }
    }

    return inputs;
  }

  public async setInputMute(inputName: string, inputMuted: boolean): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('SetInputMute', { inputName, inputMuted });
  }

  public async toggleInputMute(inputName: string): Promise<boolean> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const res = await this.obs.call('ToggleInputMute', { inputName });
    return res.inputMuted;
  }

  public async setInputVolume(inputName: string, volumeMul: number): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const clamped = Math.max(0, Math.min(1, volumeMul));
    await this.obs.call('SetInputVolume', { inputName, inputVolumeMul: clamped });
  }

  public async getMediaInputs(): Promise<OBSMediaInput[]> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const data = await this.obs.call('GetInputList');
    const mediaInputs: OBSMediaInput[] = [];

    for (const input of data.inputs as any[]) {
      const kind = input.inputKind || '';
      if (kind.includes('media') || kind.includes('ffmpeg') || kind.includes('vlc')) {
        let mediaStatus: any = {};
        try {
          mediaStatus = await this.obs.call('GetMediaInputStatus', { inputName: input.inputName });
        } catch {
          // Ignore
        }
        mediaInputs.push({
          inputName: input.inputName,
          inputKind: kind,
          mediaState: mediaStatus.mediaState,
          mediaDuration: mediaStatus.mediaDuration,
          mediaCursor: mediaStatus.mediaCursor,
        });
      }
    }

    return mediaInputs;
  }

  public async triggerMediaAction(
    inputName: string,
    mediaAction: 'OBS_WEBMEDIA_INPUT_ACTION_PLAY' | 'OBS_WEBMEDIA_INPUT_ACTION_PAUSE' | 'OBS_WEBMEDIA_INPUT_ACTION_RESTART' | 'OBS_WEBMEDIA_INPUT_ACTION_STOP'
  ): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('TriggerMediaInputAction', { inputName, mediaAction });
  }

  public async getStreamStatus(): Promise<OBSStreamStatus> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const res = await this.obs.call('GetStreamStatus');
    return {
      active: res.outputActive,
      reconnecting: res.outputReconnecting,
      timecode: res.outputTimecode,
      duration: res.outputDuration,
      bytes: res.outputBytes,
      kbitsPerSec: (res as any).outputKbitsPerSec,
      skippedFrames: res.outputSkippedFrames,
      totalFrames: res.outputTotalFrames,
    };
  }

  public async startStream(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('StartStream');
  }

  public async stopStream(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('StopStream');
  }

  public async getRecordStatus(): Promise<OBSRecordStatus> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const res = await this.obs.call('GetRecordStatus');
    return {
      active: res.outputActive,
      paused: res.outputPaused,
      timecode: res.outputTimecode,
      duration: res.outputDuration,
      bytes: res.outputBytes,
    };
  }

  public async startRecord(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('StartRecord');
  }

  public async stopRecord(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('StopRecord');
  }

  public async pauseRecord(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('PauseRecord');
  }

  public async resumeRecord(): Promise<void> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    await this.obs.call('ResumeRecord');
  }

  public async getSourceScreenshot(sourceName: string, width = 640, height = 360): Promise<string> {
    if (!this.isConnected || !this.obs) throw new Error('OBS is not connected');
    const res = await this.obs.call('GetSourceScreenshot', {
      sourceName,
      imageFormat: 'jpeg',
      imageWidth: width,
      imageHeight: height,
      imageCompressionQuality: 65,
    });
    return res.imageData;
  }
}

export const obsService = new OBSConnectionService();
