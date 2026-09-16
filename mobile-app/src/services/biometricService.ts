import * as LocalAuthentication from 'expo-local-authentication';

export async function checkBiometricSupport(): Promise<{
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType: string;
}> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType = 'Biometrics';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'Touch ID / Fingerprint';
    }

    return { hasHardware, isEnrolled, biometricType };
  } catch {
    return { hasHardware: false, isEnrolled: false, biometricType: 'Biometrics' };
  }
}

export async function authenticateWithBiometrics(promptMessage: string = 'Authenticate to access Employee Task Manager'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
