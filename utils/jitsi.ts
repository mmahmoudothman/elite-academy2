export function generateJitsiRoomName(courseId: string): string {
  return `elite-${courseId}-${Date.now()}`;
}

export function getJitsiMeetUrl(roomName: string, _password?: string): string {
  return `https://meet.jit.si/${roomName}`;
}

export function generateJitsiEmbedConfig(roomName: string, userName: string, options?: {
  password?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
}): object {
  return {
    roomName,
    parentNode: undefined,
    userInfo: { displayName: userName },
    configOverwrite: {
      startWithAudioMuted: options?.startWithAudioMuted ?? true,
      startWithVideoMuted: options?.startWithVideoMuted ?? false,
      prejoinPageEnabled: false,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'desktop', 'hangup', 'raisehand', 'tileview'],
      SHOW_JITSI_WATERMARK: false,
    },
  };
}
