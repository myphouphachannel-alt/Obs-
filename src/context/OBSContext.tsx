/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { obsService } from '../services/obs';
import {
  ConnectionStatus,
  OBSScene,
  OBSSceneItem,
  OBSAudioInput,
  OBSStreamStatus,
  OBSRecordStatus,
  OBSMediaInput,
  RemoteSettings,
  CameraPadConfig,
} from '../types/obs';

const DEFAULT_SETTINGS: RemoteSettings = {
  screenshotInterval: 2000,
  enableHaptics: true,
  confirmStreamStop: true,
  confirmRecordStop: true,
  cameraPads: [
    { id: '1', label: 'CAM 1', type: 'scene', targetSceneName: '', color: 'blue' },
    { id: '2', label: 'CAM 2', type: 'scene', targetSceneName: '', color: 'blue' },
    { id: '3', label: 'CAM 3', type: 'scene', targetSceneName: '', color: 'blue' },
    { id: '4', label: 'MAIN CAM', type: 'scene', targetSceneName: '', color: 'emerald' },
    { id: '5', label: 'WIDE', type: 'scene', targetSceneName: '', color: 'purple' },
    { id: '6', label: 'CLOSE UP', type: 'scene', targetSceneName: '', color: 'amber' },
  ],
};

interface OBSContextValue {
  status: ConnectionStatus;
  statusMessage: string;
  obsVersion: string;
  obsWsVersion: string;
  serverIp: string;
  serverPort: number;
  rememberSettings: boolean;
  scenes: OBSScene[];
  currentProgramScene: string;
  currentPreviewScene: string | null;
  studioMode: boolean;
  sceneItems: OBSSceneItem[];
  selectedSceneForItems: string;
  audioInputs: OBSAudioInput[];
  mediaInputs: OBSMediaInput[];
  streamStatus: OBSStreamStatus;
  recordStatus: OBSRecordStatus;
  settings: RemoteSettings;
  activeTab: string;
  isActionLoading: boolean;
  connect: (ip: string, port: number, password?: string, remember?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  testConnection: (ip: string, port: number, password?: string) => Promise<string>;
  switchProgramScene: (sceneName: string) => Promise<void>;
  switchPreviewScene: (sceneName: string) => Promise<void>;
  toggleStudioMode: () => Promise<void>;
  triggerTransition: () => Promise<void>;
  selectSceneForItems: (sceneName: string) => Promise<void>;
  toggleSceneItem: (sceneName: string, sceneItemId: number, enabled: boolean) => Promise<void>;
  toggleAudioMute: (inputName: string) => Promise<void>;
  setAudioVolume: (inputName: string, volumeMul: number) => Promise<void>;
  startStreaming: () => Promise<void>;
  stopStreaming: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  triggerMedia: (inputName: string, action: 'OBS_WEBMEDIA_INPUT_ACTION_PLAY' | 'OBS_WEBMEDIA_INPUT_ACTION_PAUSE' | 'OBS_WEBMEDIA_INPUT_ACTION_RESTART' | 'OBS_WEBMEDIA_INPUT_ACTION_STOP') => Promise<void>;
  updateSettings: (newSettings: Partial<RemoteSettings>) => void;
  updateCameraPad: (index: number, pad: CameraPadConfig) => void;
  setActiveTab: (tab: string) => void;
  refreshAllData: () => Promise<void>;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
}

const OBSContext = createContext<OBSContextValue | null>(null);

export const OBSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('พร้อมเชื่อมต่อกับ OBS Studio');
  const [obsVersion, setObsVersion] = useState<string>('');
  const [obsWsVersion, setObsWsVersion] = useState<string>('');
  
  // Default IP and Port saved in localStorage (never password)
  const [serverIp, setServerIp] = useState<string>(() => {
    return localStorage.getItem('obs_remote_ip') || '';
  });
  const [serverPort, setServerPort] = useState<number>(() => {
    const p = localStorage.getItem('obs_remote_port');
    return p ? parseInt(p, 10) : 4455;
  });
  const [rememberSettings, setRememberSettings] = useState<boolean>(() => {
    return localStorage.getItem('obs_remote_remember') !== 'false';
  });

  const [scenes, setScenes] = useState<OBSScene[]>([]);
  const [currentProgramScene, setCurrentProgramScene] = useState<string>('');
  const [currentPreviewScene, setCurrentPreviewScene] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState<boolean>(false);
  
  const [selectedSceneForItems, setSelectedSceneForItems] = useState<string>('');
  const [sceneItems, setSceneItems] = useState<OBSSceneItem[]>([]);
  
  const [audioInputs, setAudioInputs] = useState<OBSAudioInput[]>([]);
  const [mediaInputs, setMediaInputs] = useState<OBSMediaInput[]>([]);
  
  const [streamStatus, setStreamStatus] = useState<OBSStreamStatus>({
    active: false,
    reconnecting: false,
    timecode: '00:00:00',
    duration: 0,
    bytes: 0,
  });
  
  const [recordStatus, setRecordStatus] = useState<OBSRecordStatus>({
    active: false,
    paused: false,
    timecode: '00:00:00',
    duration: 0,
    bytes: 0,
  });

  const [settings, setSettings] = useState<RemoteSettings>(() => {
    const saved = localStorage.getItem('obs_remote_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Vibration feedback for tactile mobile feeling
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!settings.enableHaptics || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      if (type === 'light') navigator.vibrate(12);
      else if (type === 'medium') navigator.vibrate(28);
      else if (type === 'heavy') navigator.vibrate([40, 30, 40]);
    } catch {
      // Ignore if not permitted
    }
  }, [settings.enableHaptics]);

  const updateSettings = useCallback((newSettings: Partial<RemoteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('obs_remote_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateCameraPad = useCallback((index: number, pad: CameraPadConfig) => {
    setSettings((prev) => {
      const pads = [...prev.cameraPads];
      pads[index] = pad;
      const updated = { ...prev, cameraPads: pads };
      localStorage.setItem('obs_remote_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fetch all initial data from real OBS
  const refreshAllData = useCallback(async () => {
    if (!obsService.getIsConnected()) return;

    try {
      // 1. Studio mode
      const isStudio = await obsService.getStudioModeEnabled();
      setStudioMode(isStudio);

      // 2. Scenes
      const sceneData = await obsService.getScenes();
      setScenes(sceneData.scenes);
      setCurrentProgramScene(sceneData.currentProgramSceneName);
      setCurrentPreviewScene(sceneData.currentPreviewSceneName);

      const targetScene = sceneData.currentProgramSceneName;
      setSelectedSceneForItems(targetScene);

      // 3. Scene items for active program scene
      if (targetScene) {
        try {
          const items = await obsService.getSceneItems(targetScene);
          setSceneItems(items);
        } catch (err) {
          console.warn('Could not load scene items:', err);
        }
      }

      // 4. Audio Inputs
      try {
        const audios = await obsService.getAudioInputs();
        setAudioInputs(audios);
      } catch (err) {
        console.warn('Could not load audio inputs:', err);
      }

      // 5. Media Inputs
      try {
        const medias = await obsService.getMediaInputs();
        setMediaInputs(medias);
      } catch (err) {
        console.warn('Could not load media inputs:', err);
      }

      // 6. Stream Status
      try {
        const stream = await obsService.getStreamStatus();
        setStreamStatus(stream);
      } catch (err) {
        console.warn('Could not load stream status:', err);
      }

      // 7. Record Status
      try {
        const record = await obsService.getRecordStatus();
        setRecordStatus(record);
      } catch (err) {
        console.warn('Could not load record status:', err);
      }
    } catch (err: any) {
      console.error('Failed to refresh OBS data:', err);
    }
  }, []);

  // Setup Event Listeners for real-time OBS WebSocket events
  useEffect(() => {
    const unsubs = [
      obsService.on('CurrentProgramSceneChanged', (data) => {
        if (data?.sceneName) {
          setCurrentProgramScene(data.sceneName);
          // Auto update scene items if user is viewing program scene
          obsService.getSceneItems(data.sceneName).then(setSceneItems).catch(() => {});
        }
      }),

      obsService.on('CurrentPreviewSceneChanged', (data) => {
        if (data?.sceneName) {
          setCurrentPreviewScene(data.sceneName);
        }
      }),

      obsService.on('SceneListChanged', () => {
        obsService.getScenes().then((data) => {
          setScenes(data.scenes);
          setCurrentProgramScene(data.currentProgramSceneName);
          setCurrentPreviewScene(data.currentPreviewSceneName);
        }).catch(() => {});
      }),

      obsService.on('StudioModeStateChanged', (data) => {
        setStudioMode(Boolean(data?.studioModeEnabled));
      }),

      obsService.on('SceneItemEnableStateChanged', (data) => {
        setSceneItems((prev) =>
          prev.map((item) =>
            item.sceneItemId === data?.sceneItemId
              ? { ...item, sceneItemEnabled: data?.sceneItemEnabled }
              : item
          )
        );
      }),

      obsService.on('InputMuteStateChanged', (data) => {
        setAudioInputs((prev) =>
          prev.map((inp) =>
            inp.inputName === data?.inputName ? { ...inp, muted: data?.inputMuted } : inp
          )
        );
      }),

      obsService.on('InputVolumeChanged', (data) => {
        setAudioInputs((prev) =>
          prev.map((inp) =>
            inp.inputName === data?.inputName
              ? {
                  ...inp,
                  volumeMul: data?.inputVolumeMul ?? inp.volumeMul,
                  volumeDb: data?.inputVolumeDb ?? inp.volumeDb,
                }
              : inp
          )
        );
      }),

      obsService.on('StreamStateChanged', (data) => {
        setStreamStatus((prev) => ({
          ...prev,
          active: Boolean(data?.outputActive),
          reconnecting: Boolean(data?.outputState === 'OBS_WEBSOCKET_OUTPUT_RECONNECTING'),
        }));
      }),

      obsService.on('RecordStateChanged', (data) => {
        setRecordStatus((prev) => ({
          ...prev,
          active: Boolean(data?.outputActive),
          paused: Boolean(data?.outputState === 'OBS_WEBSOCKET_OUTPUT_PAUSED'),
        }));
      }),

      obsService.on('ConnectionClosed', (data) => {
        setStatus('disconnected');
        setStatusMessage(
          data?.intentional
            ? 'ตัดการเชื่อมต่อเรียบร้อยแล้ว'
            : 'การเชื่อมต่อกับ OBS Studio ขาดหาย กรุณาตรวจสอบว่า OBS เปิดอยู่และอยู่ในเครือข่ายเดียวกัน'
        );
      }),

      obsService.on('ConnectionError', (err) => {
        setStatus('error');
        setStatusMessage(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ OBS Studio');
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Polling Stream & Record timer every second while active
  useEffect(() => {
    if (status !== 'connected') return;
    if (!streamStatus.active && !recordStatus.active) return;

    const interval = setInterval(async () => {
      try {
        if (streamStatus.active) {
          const s = await obsService.getStreamStatus();
          setStreamStatus(s);
        }
        if (recordStatus.active) {
          const r = await obsService.getRecordStatus();
          setRecordStatus(r);
        }
      } catch {
        // Ignore periodic timer fetch error
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, streamStatus.active, recordStatus.active]);

  // Connect action
  const connect = async (ip: string, port: number, password?: string, remember = true) => {
    setStatus('connecting');
    setStatusMessage(`กำลังเชื่อมต่อไปยัง ws://${ip}:${port}...`);
    try {
      const ver = await obsService.connect(ip, port, password);
      setStatus('connected');
      setStatusMessage(`เชื่อมต่อกับ OBS Studio v${ver.version} สำเร็จ`);
      setObsVersion(ver.version);
      setObsWsVersion(ver.obsWebSocketVersion);
      setServerIp(ip);
      setServerPort(port);
      setRememberSettings(remember);

      if (remember) {
        localStorage.setItem('obs_remote_ip', ip);
        localStorage.setItem('obs_remote_port', port.toString());
        localStorage.setItem('obs_remote_remember', 'true');
      } else {
        localStorage.removeItem('obs_remote_ip');
        localStorage.removeItem('obs_remote_port');
        localStorage.setItem('obs_remote_remember', 'false');
      }

      triggerHaptic('medium');
      await refreshAllData();
    } catch (err: any) {
      setStatus('error');
      const errText = err?.message || String(err);
      setStatusMessage(`เชื่อมต่อไม่สำเร็จ: ${errText}`);
      throw err;
    }
  };

  // Test Connection action without switching views
  const testConnection = async (ip: string, port: number, password?: string): Promise<string> => {
    try {
      const res = await obsService.connect(ip, port, password);
      const msg = `ทดสอบสำเร็จ: OBS Studio v${res.version} (WebSocket v${res.obsWebSocketVersion})`;
      await obsService.disconnect();
      return msg;
    } catch (err: any) {
      throw new Error(err?.message || 'ไม่สามารถติดต่อ OBS WebSocket ได้');
    }
  };

  // Disconnect action
  const disconnect = async () => {
    await obsService.disconnect();
    setStatus('disconnected');
    setStatusMessage('ตัดการเชื่อมต่อแล้ว');
    triggerHaptic('light');
  };

  // Scene switching
  const switchProgramScene = async (sceneName: string) => {
    if (!sceneName || sceneName === currentProgramScene) return;
    setIsActionLoading(true);
    try {
      await obsService.setCurrentProgramScene(sceneName);
      setCurrentProgramScene(sceneName);
      triggerHaptic('medium');
    } catch (err: any) {
      setStatusMessage(`ไม่สามารถเปลี่ยน Scene: ${err?.message || err}`);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const switchPreviewScene = async (sceneName: string) => {
    if (!sceneName || sceneName === currentPreviewScene) return;
    setIsActionLoading(true);
    try {
      await obsService.setCurrentPreviewScene(sceneName);
      setCurrentPreviewScene(sceneName);
      triggerHaptic('light');
    } catch (err: any) {
      setStatusMessage(`ไม่สามารถเปลี่ยน Preview: ${err?.message || err}`);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleStudioMode = async () => {
    try {
      const next = !studioMode;
      await obsService.setStudioModeEnabled(next);
      setStudioMode(next);
      triggerHaptic('light');
    } catch (err: any) {
      setStatusMessage(`Studio Mode error: ${err?.message || err}`);
    }
  };

  const triggerTransition = async () => {
    try {
      await obsService.triggerStudioModeTransition();
      triggerHaptic('heavy');
    } catch (err: any) {
      setStatusMessage(`Transition error: ${err?.message || err}`);
    }
  };

  const selectSceneForItems = async (sceneName: string) => {
    setSelectedSceneForItems(sceneName);
    try {
      const items = await obsService.getSceneItems(sceneName);
      setSceneItems(items);
    } catch (err: any) {
      console.warn('Failed to load items for scene:', sceneName, err);
    }
  };

  const toggleSceneItem = async (sceneName: string, sceneItemId: number, enabled: boolean) => {
    try {
      await obsService.setSceneItemEnabled(sceneName, sceneItemId, enabled);
      setSceneItems((prev) =>
        prev.map((item) =>
          item.sceneItemId === sceneItemId ? { ...item, sceneItemEnabled: enabled } : item
        )
      );
      triggerHaptic('light');
    } catch (err: any) {
      setStatusMessage(`Source toggle error: ${err?.message || err}`);
    }
  };

  const toggleAudioMute = async (inputName: string) => {
    try {
      const current = audioInputs.find((a) => a.inputName === inputName);
      const nextMuted = !current?.muted;
      await obsService.setInputMute(inputName, nextMuted);
      setAudioInputs((prev) =>
        prev.map((a) => (a.inputName === inputName ? { ...a, muted: nextMuted } : a))
      );
      triggerHaptic('light');
    } catch (err: any) {
      setStatusMessage(`Audio mute error: ${err?.message || err}`);
    }
  };

  const setAudioVolume = async (inputName: string, volumeMul: number) => {
    try {
      await obsService.setInputVolume(inputName, volumeMul);
      setAudioInputs((prev) =>
        prev.map((a) => (a.inputName === inputName ? { ...a, volumeMul } : a))
      );
    } catch (err: any) {
      setStatusMessage(`Audio volume error: ${err?.message || err}`);
    }
  };

  const startStreaming = async () => {
    setIsActionLoading(true);
    try {
      await obsService.startStream();
      setStreamStatus((prev) => ({ ...prev, active: true }));
      triggerHaptic('heavy');
    } catch (err: any) {
      setStatusMessage(`Live start error: ${err?.message || err}`);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const stopStreaming = async () => {
    setIsActionLoading(true);
    try {
      await obsService.stopStream();
      setStreamStatus((prev) => ({ ...prev, active: false }));
      triggerHaptic('heavy');
    } catch (err: any) {
      setStatusMessage(`Live stop error: ${err?.message || err}`);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const startRecording = async () => {
    setIsActionLoading(true);
    try {
      await obsService.startRecord();
      setRecordStatus((prev) => ({ ...prev, active: true }));
      triggerHaptic('heavy');
    } catch (err: any) {
      setStatusMessage(`Record start error: ${err?.message || err}`);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const stopRecording = async () => {
    setIsActionLoading(true);
    try {
      await obsService.stopRecord();
      setRecordStatus((prev) => ({ ...prev, active: false }));
      triggerHaptic('heavy');
    } catch (err: any) {
      setStatusMessage(`Record stop error: ${err?.message || err}`);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const pauseRecording = async () => {
    try {
      await obsService.pauseRecord();
      setRecordStatus((prev) => ({ ...prev, paused: true }));
      triggerHaptic('medium');
    } catch (err: any) {
      setStatusMessage(`Record pause error: ${err?.message || err}`);
    }
  };

  const resumeRecording = async () => {
    try {
      await obsService.resumeRecord();
      setRecordStatus((prev) => ({ ...prev, paused: false }));
      triggerHaptic('medium');
    } catch (err: any) {
      setStatusMessage(`Record resume error: ${err?.message || err}`);
    }
  };

  const triggerMedia = async (
    inputName: string,
    action: 'OBS_WEBMEDIA_INPUT_ACTION_PLAY' | 'OBS_WEBMEDIA_INPUT_ACTION_PAUSE' | 'OBS_WEBMEDIA_INPUT_ACTION_RESTART' | 'OBS_WEBMEDIA_INPUT_ACTION_STOP'
  ) => {
    try {
      await obsService.triggerMediaAction(inputName, action);
      triggerHaptic('light');
    } catch (err: any) {
      setStatusMessage(`Media action error: ${err?.message || err}`);
    }
  };

  return (
    <OBSContext.Provider
      value={{
        status,
        statusMessage,
        obsVersion,
        obsWsVersion,
        serverIp,
        serverPort,
        rememberSettings,
        scenes,
        currentProgramScene,
        currentPreviewScene,
        studioMode,
        sceneItems,
        selectedSceneForItems,
        audioInputs,
        mediaInputs,
        streamStatus,
        recordStatus,
        settings,
        activeTab,
        isActionLoading,
        connect,
        disconnect,
        testConnection,
        switchProgramScene,
        switchPreviewScene,
        toggleStudioMode,
        triggerTransition,
        selectSceneForItems,
        toggleSceneItem,
        toggleAudioMute,
        setAudioVolume,
        startStreaming,
        stopStreaming,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        triggerMedia,
        updateSettings,
        updateCameraPad,
        setActiveTab,
        refreshAllData,
        triggerHaptic,
      }}
    >
      {children}
    </OBSContext.Provider>
  );
};

export const useOBS = () => {
  const ctx = useContext(OBSContext);
  if (!ctx) throw new Error('useOBS must be used within an OBSProvider');
  return ctx;
};
