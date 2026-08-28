// Web Speech Recognition & Speech Synthesis Service
export class AudioService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initRecognition();
      this.loadVoices();
    }
  }

  private initRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (err) {
        console.warn('Speech recognition init warning:', err);
      }
    }
  }

  private loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public isSpeechSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices.filter((v) => v.lang.startsWith('en'));
  }

  /**
   * Listen for user speech and return final transcript + latency
   */
  public startListening(
    onInterim: (text: string) => void,
    onResult: (finalText: string, asrMs: number) => void,
    onError: (errorMsg: string) => void
  ): void {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. You can type your request in the chat input.');
      return;
    }

    const startTime = Date.now();
    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (interim) {
        onInterim(interim);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (event.error === 'no-speech') {
        onError('No speech detected. Please tap the microphone and speak clearly.');
      } else if (event.error === 'not-allowed') {
        onError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else {
        onError(`Audio recognition note: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      const asrMs = Date.now() - startTime;
      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim(), asrMs);
      }
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      console.warn('Recognition start exception, retrying:', err);
      try {
        this.recognition.abort();
        setTimeout(() => this.recognition.start(), 100);
      } catch (e) {
        onError('Could not start microphone. Please try again.');
      }
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Speak text response aloud using SpeechSynthesis
   */
  public speak(
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stopSpeaking();

    // Clean text of markdown artifacts for smooth speech synthesis
    const cleanSpeechText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
    utterance.rate = options.rate !== undefined ? options.rate : 1.05;

    // Pick preferred voice if specified
    const available = this.getAvailableVoices();
    if (options.voiceName && available.length > 0) {
      const match = available.find((v) => v.name === options.voiceName);
      if (match) utterance.voice = match;
    } else if (available.length > 0) {
      // Pick a natural English voice if available (e.g. Google US English, Samantha, Natural)
      const naturalVoice = available.find(
        (v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')
      );
      if (naturalVoice) utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      if (options.onError) options.onError(e);
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop any active audio speech immediately (Interruption handling)
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const audioService = new AudioService();
