import { useEffect, useState, useMemo } from "react";
import { BsPauseFill, BsPlayFill, BsRepeat, BsRepeat1 } from "react-icons/bs";
import { FaRandom } from "react-icons/fa";

import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { Howl, Howler } from "howler";

import { useShuffle } from "./ShuffleContext";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";
import Timeline from "./Timeline";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();

  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Howl | null>(null);
  const { isShuffling, setIsShuffling } = useShuffle();
  const [nextSong] = useState<number>(0);
  const [seek, setSeek] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [originalVolume, setOriginalVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  useEffect(() => {
    const newSound = new Howl({
      src: [songUrl],
      volume: volume,
      onplay: () => setIsPlaying(true),
      onend: () => {
        setIsPlaying(false);
        onPlayNext();
      },
      onpause: () => setIsPlaying(false),
      format: ["mp3"],
    });

    setSound(newSound);

    return () => {
      newSound.unload();
    };
  }, [songUrl]);

  const toggleRepeat = () => {
    setIsRepeating((prevIsRepeating) => !prevIsRepeating);
  };

  const shuffledIds = useMemo(() => {
    const ids = player.ids.slice();
    for (let i = ids.length - 7; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 7));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }, [player.ids]);

  const onPlayNext = () => {
    // ... your logic for playing the next song
    if (player.ids.length === 0) {
      return;
    }

    let nextSong;
    if (isShuffling) {
      const shuffledIds = player.ids.slice().sort(() => Math.random() - 0.5);
      nextSong = shuffledIds.find((id) => id !== player.activeId);
    } else {
      const currentIndex = player.ids.findIndex((id) => id === player.activeId);
      nextSong = player.ids[currentIndex + 1];
    }

    if (nextSong === undefined) {
      nextSong = isShuffling ? player.ids[0] : player.activeId;
    }

    if (nextSong !== undefined) {
      player.setId(nextSong);
    }
  };

  useEffect(() => {
    if (sound) {
      sound.on("end", () => {
        // Check if repeat mode is active, if yes, play the same song again
        if (isRepeating) {
          sound.seek(0); // Rewind the song to the beginning
          sound.play();
        } else {
          // If repeat mode is not active, move to the next song
          onPlayNext();
        }
      });
    }
  }, [sound, isRepeating, onPlayNext]);

  const onPlayPrevious = () => {
    // ... your logic for playing the previous song
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  };

  useEffect(() => {
    sound?.play();

    return () => {
      sound?.unload();
    };
  }, [sound]);

  const handlePlay = () => {
    if (sound) {
      if (!isPlaying) {
        sound.play();
      } else {
        sound.pause();
      }
    }
  };

  const [isButtonClicked, setIsButtonClicked] = useState(() => {
    // Retrieve the value from localStorage, defaulting to false if not found
    const storedValue = localStorage.getItem("isButtonClicked");
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const toggleShuffle = () => {
    setIsShuffling((prevShuffling) => !prevShuffling);
    // Update the isButtonClicked state
    setIsButtonClicked((prevIsButtonClicked: boolean) => !prevIsButtonClicked);
  };

  useEffect(() => {
    localStorage.setItem("isButtonClicked", JSON.stringify(isButtonClicked));
  }, [isButtonClicked]);

  const handleVolumeChange = (newVolume: number) => {
    if (sound) {
      sound.volume(newVolume);
    }
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (sound) {
      if (isMuted) {
        // If already muted, unmute and set volume back to original value
        sound.volume(originalVolume);
        setVolume(originalVolume);
      } else {
        // If not muted, save the current volume, mute by setting volume to 0
        setOriginalVolume(volume);
        sound.volume(0);
        setVolume(0);
      }

      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (sound) {
      sound.on("load", () => {
        const duration = sound.duration();
        setDuration(duration);

        sound.on("play", () => {
          // Update seek position during playback
          const updateSeekInterval = setInterval(() => {
            setSeek(sound.seek());
          }, 1000);

          // Cleanup interval when the sound pauses or ends
          sound.on("pause", () => clearInterval(updateSeekInterval));
          sound.on("end", () => clearInterval(updateSeekInterval));
        });
      });
    }
  }, [sound]);

  const handleSeekChange = (newSeek: number) => {
    if (sound) {
      // Update seek position without pausing or playing the sound
      sound.seek(newSeek);
      setSeek(newSeek);
    }
  };

  return (
    // ... your JSX remains the same
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      <div>
        <div
          className="
        flex 
        md:hidden 
        col-auto 
        w-full 
        justify-end 
        items-center
        gap-x-2
        mt-3
      "
        >
          <button onClick={toggleRepeat}>
            {isRepeating ? <BsRepeat1 size={18} /> : <BsRepeat size={18} />}
          </button>

          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={25}
            className="
          text-neutral-400 
          cursor-pointer 
          hover:text-white 
          transition
          min-w-[25px]
        "
          />
          <div
            onClick={handlePlay}
            className="
          h-10
          w-10
          flex 
          items-center 
          justify-center 
          rounded-full 
          bg-white 
          p-1 
          cursor-pointer
          
        "
          >
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward
            onClick={onPlayNext}
            size={25}
            className="
          text-neutral-400 
          cursor-pointer 
          hover:text-white 
          transition
          min-w-[25px]
        "
          />
          <button onClick={toggleShuffle}>
            {isButtonClicked ? (
              <FaRandom size={18} color="red" /> // Change color to blue when button is clicked
            ) : (
              <FaRandom size={18} />
            )}
          </button>
        </div>
        <div
          className="
        hidden
        h-full
        md:flex  
        lg:flex
        xl:flex
        justify-center 
        items-center 
        w-full 
        gap-x-6
        md:gap-x-3
        lg:gap-x-6
        pb-2
      "
        >
          <span className="lg:text-sm md:text-xs pl-10">
            {formatTime(seek)}
          </span>

          <button onClick={toggleRepeat}>
            {isRepeating ? <BsRepeat1 size={18} /> : <BsRepeat size={18} />}
          </button>

          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={25}
            className="
          text-neutral-400 
          cursor-pointer 
          hover:text-white 
          transition
          min-w-[25px]
        "
          />
          <div
            onClick={handlePlay}
            className="
          flex 
          items-center 
          justify-center
          h-8
          w-8 
          rounded-full 
          bg-white 
          p-1 
          cursor-pointer
        "
          >
            <Icon size={25} className="text-black" />

            <div className=" mt-16  absolute ">
              <Timeline
                value={seek}
                max={duration}
                onChange={handleSeekChange}
              />
            </div>
          </div>

          <AiFillStepForward
            onClick={onPlayNext}
            size={25}
            className="
          text-neutral-400 
          cursor-pointer 
          hover:text-white 
          transition
          min-w-[25px]
        "
          />

          <button onClick={toggleShuffle}>
            {isButtonClicked ? (
              <FaRandom size={18} color="red" /> // Change color to blue when button is clicked
            ) : (
              <FaRandom size={18} />
            )}
          </button>

          <span className="lg:text-sm md:text-xs">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[130px]">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={34}
          />
          <Slider value={volume} onChange={handleVolumeChange} />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
  return `${formattedMinutes}:${formattedSeconds}`;
}
