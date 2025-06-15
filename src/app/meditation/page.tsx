'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/Navbar';
import { useScrollDirection } from '@/components/hooks/useScrollDirection';
import MeditationHistory from '@/components/MeditationHistory';
import MeditationHistoryGraph from '@/components/MeditationHistoryGraph';
import MeditationTimer from '@/components/MeditationTimer';

// Standard meditation options
const standardMeditations = [
	{
		id: 'mindful-breathing',
		name: 'Mindful Breathing',
		description: 'Focus on your breath to calm your mind and reduce stress',
		duration: 5, // minutes
		bgColor: 'from-blue-500 to-blue-600',
		icon: '🌬️',
		steps: [
			'Find a comfortable seated position with your back straight',
			'Close your eyes or maintain a soft gaze',
			'Breathe naturally through your nose',
			'Focus your attention on the sensation of breathing',
			'When your mind wanders, gently bring attention back to your breath',
			'Continue for the duration of the session',
		],
	},
	{
		id: 'body-scan',
		name: 'Body Scan',
		description:
			'Progressively focus attention throughout your body to release tension',
		duration: 10, // minutes
		bgColor: 'from-indigo-500 to-indigo-600',
		icon: '👤',
		steps: [
			'Lie down in a comfortable position on your back',
			'Take a few deep breaths and begin to relax',
			'Bring awareness to your feet and notice any sensations',
			'Slowly move your attention upward through your legs, torso, arms, and head',
			'Notice any areas of tension and allow them to soften',
			'Complete the scan by taking a few deep breaths',
		],
	},
	{
		id: 'loving-kindness',
		name: 'Loving Kindness',
		description: 'Cultivate feelings of compassion for yourself and others',
		duration: 8, // minutes
		bgColor: 'from-purple-500 to-purple-600',
		icon: '❤️',
		steps: [
			'Sit comfortably with your eyes closed',
			'Bring to mind someone you care about deeply',
			'Silently repeat: "May you be happy, may you be healthy, may you be safe"',
			'Extend these wishes to yourself',
			'Gradually extend these wishes to others, including difficult people',
			'End by extending these wishes to all beings everywhere',
		],
	},
];

export default function MeditationPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const scrollDirection = useScrollDirection();
	
	// ADD THIS: Missing refreshKey state
	const [refreshKey, setRefreshKey] = useState(0);
	
	const [selectedMeditation, setSelectedMeditation] = useState<string | null>(
		null
	);
	const [isCustomTimer, setIsCustomTimer] = useState(false);
	const [customDuration, setCustomDuration] = useState(10);

	// Timer state
	const [timerActive, setTimerActive] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [totalTime, setTotalTime] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const [isMeditationComplete, setIsMeditationComplete] = useState(false);

	// Sound elements
	const bellSoundRef = useRef<HTMLAudioElement | null>(null);
	const ambienceSoundRef = useRef<HTMLAudioElement | null>(null);
	const [ambientSound, setAmbientSound] = useState('nature');
	const [volume, setVolume] = useState(50);

	useEffect(() => {
		if (!loading && !user) {
			router.replace('/login');
		}

		// Initialize the audio elements
		if (typeof window !== 'undefined') {
			bellSoundRef.current = new Audio('/sounds/bell.mp3');
			ambienceSoundRef.current = new Audio('/sounds/nature.mp3');
			if (ambienceSoundRef.current) {
				ambienceSoundRef.current.loop = true;
			}
		}

		return () => {
			// Clean up sounds when component unmounts
			if (ambienceSoundRef.current) {
				ambienceSoundRef.current.pause();
				ambienceSoundRef.current.src = '';
			}
			if (bellSoundRef.current) {
				bellSoundRef.current.src = '';
			}

			// Clear any active timers
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [user, loading, router]);

	// Update ambience sound when selected option changes
	useEffect(() => {
		if (ambienceSoundRef.current) {
			const wasPlaying = !ambienceSoundRef.current.paused;
			ambienceSoundRef.current.pause();

			// Change the source based on selection
			switch (ambientSound) {
				case 'nature':
					ambienceSoundRef.current.src = '/sounds/nature.mp3';
					break;
				case 'rain':
					ambienceSoundRef.current.src = '/sounds/rain.mp3';
					break;
				case 'bowls':
					ambienceSoundRef.current.src = '/sounds/bowls.mp3';
					break;
				default:
					ambienceSoundRef.current.src = '/sounds/nature.mp3';
			}

			ambienceSoundRef.current.load();
			ambienceSoundRef.current.volume = volume / 100;

			if (wasPlaying && timerActive && !isPaused) {
				ambienceSoundRef.current
					.play()
					.catch((e) => console.error('Could not play audio:', e));
			}
		}
	}, [ambientSound, timerActive, isPaused, volume]);

	// Update volume when changed
	useEffect(() => {
		if (ambienceSoundRef.current) {
			ambienceSoundRef.current.volume = volume / 100;
		}
	}, [volume]);

	useEffect(() => {
		// Timer countdown effect
		if (timerActive && !isPaused) {
			timerRef.current = setInterval(() => {
				setTimeRemaining((prev) => {
					if (prev <= 1) {
						// Timer complete
						handleTimerComplete();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [timerActive, isPaused]);

	const handleMeditationSelect = (id: string) => {
		setSelectedMeditation(id);
		setIsCustomTimer(false);
	};

	const handleCustomTimerSelect = () => {
		setSelectedMeditation(null);
		setIsCustomTimer(true);
	};

	const getCurrentMeditation = () => {
		return standardMeditations.find((m) => m.id === selectedMeditation);
	};

	const startMeditation = () => {
		// Set up the timer based on selected meditation or custom duration
		const duration = isCustomTimer
			? customDuration * 60 // convert minutes to seconds
			: (getCurrentMeditation()?.duration || 5) * 60; // default to 5 minutes

		setTotalTime(duration);
		setTimeRemaining(duration);
		setTimerActive(true);
		setIsPaused(false);
		setIsMeditationComplete(false);

		// Play ambient sound
		if (ambienceSoundRef.current) {
			ambienceSoundRef.current
				.play()
				.catch((e) => console.error('Could not play audio:', e));
		}
	};

	const pauseTimer = () => {
		setIsPaused(true);
		if (ambienceSoundRef.current) {
			ambienceSoundRef.current.pause();
		}
	};

	const resumeTimer = () => {
		setIsPaused(false);
		if (ambienceSoundRef.current) {
			ambienceSoundRef.current
				.play()
				.catch((e) => console.error('Could not play audio:', e));
		}
	};

	const stopTimer = () => {
		setTimerActive(false);
		setIsPaused(false);
		if (ambienceSoundRef.current) {
			ambienceSoundRef.current.pause();
			ambienceSoundRef.current.currentTime = 0;
		}

		// Show meditation options again
		if (isCustomTimer) {
			setShowSteps(false);
		} else if (selectedMeditation) {
			setShowSteps(true);
		}
	};

	const handleTimerComplete = () => {
		setTimerActive(false);
		setIsMeditationComplete(true);

		// Play completion bell
		if (bellSoundRef.current) {
			bellSoundRef.current
				.play()
				.catch((e) => console.error('Could not play audio:', e));
		}

		// Stop ambient sound
		if (ambienceSoundRef.current) {
			ambienceSoundRef.current.pause();
			ambienceSoundRef.current.currentTime = 0;
		}

		// Clear any active interval
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	};

	// Format time as MM:SS
	const formatTime = (totalSeconds: number) => {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
				<div className="flex flex-col items-center p-8 bg-white shadow-lg rounded-xl">
					<div className="w-12 h-12 mb-4 border-4 border-blue-400 rounded-full border-t-blue-600 animate-spin"></div>
					<div className="text-lg text-gray-700">
						Loading your meditation space...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center bg-gray-50">
			{/* Navbar with hide/show on scroll */}
			<div
				className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
					scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
				}`}
			>
				<Navbar />
			</div>
			{/* Padding to prevent content being hidden under navbar */}
			<div className="pt-20 w-full flex flex-col items-center py-12 px-4">
				<MeditationTimer onSessionSaved={() => setRefreshKey((k) => k + 1)} />
				<MeditationHistory key={`history-${refreshKey}`} />
				<MeditationHistoryGraph key={`graph-${refreshKey}`}/>
			</div>
		</div>
	);
}
