import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { audioManager } from '@/utils/audio';

export default function AudioControls() {
  const [masterVolume, setMasterVolume] = useState(audioManager.getMasterVolume() * 100);
  const [musicVolume, setMusicVolume] = useState(audioManager.getMusicVolume() * 100);
  const [sfxVolume, setSfxVolume] = useState(audioManager.getSfxVolume() * 100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(audioManager.getIsMuted());

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioManager.stopBackgroundMusic();
      setIsPlaying(false);
    } else {
      audioManager.startBackgroundMusic();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    audioManager.toggleMute();
    setIsMuted(audioManager.getIsMuted());
  };

  const handleMasterVolumeChange = (value: number[]) => {
    const vol = value[0];
    setMasterVolume(vol);
    audioManager.setMasterVolume(vol / 100);
  };

  const handleMusicVolumeChange = (value: number[]) => {
    const vol = value[0];
    setMusicVolume(vol);
    audioManager.setMusicVolume(vol / 100);
  };

  const handleSfxVolumeChange = (value: number[]) => {
    const vol = value[0];
    setSfxVolume(vol);
    audioManager.setSfxVolume(vol / 100);
  };

  const testSound = () => {
    audioManager.playSuccessSound();
  };

  return (
    <Card className="w-full max-w-md mx-auto game-card">
      <CardHeader>
        <CardTitle className="text-cyber-blue neon-text flex items-center space-x-2">
          <Icon name="Volume2" size={20} />
          <span>Аудио Настройки</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={toggleMusic}
            className={`cyber-button ${isPlaying ? 'bg-cyber-green' : ''}`}
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={16} className="mr-2" />
            {isPlaying ? 'Пауза' : 'Музыка'}
          </Button>
          
          <Button
            onClick={toggleMute}
            className={`cyber-button ${isMuted ? 'bg-cyber-red' : ''}`}
          >
            <Icon name={isMuted ? 'VolumeX' : 'Volume2'} size={16} className="mr-2" />
            {isMuted ? 'Вкл.' : 'Выкл.'}
          </Button>
          
          <Button onClick={testSound} className="cyber-button">
            <Icon name="TestTube" size={16} className="mr-2" />
            Тест
          </Button>
        </div>

        {/* Volume Sliders */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-cyber-blue">Общая громкость</label>
              <span className="text-xs text-muted-foreground">{Math.round(masterVolume)}%</span>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-cyber-purple">Музыка</label>
              <span className="text-xs text-muted-foreground">{Math.round(musicVolume)}%</span>
            </div>
            <Slider
              value={[musicVolume]}
              onValueChange={handleMusicVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-cyber-red">Звуковые эффекты</label>
              <span className="text-xs text-muted-foreground">{Math.round(sfxVolume)}%</span>
            </div>
            <Slider
              value={[sfxVolume]}
              onValueChange={handleSfxVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Hotkeys Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Горячие клавиши: M - вкл/выкл звук
        </div>
      </CardContent>
    </Card>
  );
}