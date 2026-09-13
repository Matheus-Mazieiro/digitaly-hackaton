import { useEffect, useRef, useState } from 'react';

/**
 * Transcrição usando a Web Speech API nativa do Chrome/Edge.
 * - Sem chave, sem backend, sem custo.
 * - Reconhecimento feito na nuvem do Google, mas sem conta.
 * - pt-BR funciona muito bem.
 * - Limitação: só Chrome/Edge desktop.
 *
 * Emite `onTranscript({ who, text })` a cada turno final detectado.
 */
export function useWebSpeechTranscription({ enabled, role }) {
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(null);
  const restartRef = useRef(false);
  const lastErrorRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setError(
        new Error(
          'Seu navegador não suporta transcrição nativa. Use Chrome ou Edge.',
        ),
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[speech] iniciado');
      setConnected(true);
      restartRef.current = true;
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text && onTranscriptRef.current) {
            onTranscriptRef.current({ who: role, text });
          }
        }
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' e 'aborted' são normais e não devem virar erro na UI
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      console.warn('[speech] erro', event.error);

      if (event.error === 'not-allowed') {
        setError(new Error('Permissão de microfone negada.'));
        restartRef.current = false;
      } else if (event.error === 'network') {
        // evita spam de toasts iguais
        if (lastErrorRef.current !== 'network') {
          setError(new Error('Sem conexão para o reconhecimento de voz.'));
          lastErrorRef.current = 'network';
        }
      } else {
        setError(new Error(`Erro de reconhecimento: ${event.error}`));
      }
    };

    recognition.onend = () => {
      console.log('[speech] encerrado');
      setConnected(false);
      // Chrome encerra sozinho após ~60s de silêncio. Reinicia se ainda estiver ativo.
      if (restartRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('[speech] erro ao reiniciar', e);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('[speech] erro ao iniciar', e);
      setError(e);
    }

    return () => {
      restartRef.current = false;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setConnected(false);
    };
  }, [enabled, role]);

  const onTranscript = (cb) => {
    onTranscriptRef.current = cb;
  };

  return { connected, error, supported, onTranscript };
}