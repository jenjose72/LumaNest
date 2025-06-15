'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/Navbar';
import { useScrollDirection } from '@/components/hooks/useScrollDirection';

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
	const [selectedMeditation, setSelectedMeditation] = useState<string | null>(
		null
	);
	const [showSteps, setShowSteps] = useState(false);
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
		bellSoundRef.current = new Audio('/sounds/bell.mp3');
		ambienceSoundRef.current = new Audio('/sounds/nature.mp3');
		ambienceSoundRef.current.loop = true;

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
	}, [ambientSound, timerActive, isPaused]);

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
		setShowSteps(true);
	};

	const handleCustomTimerSelect = () => {
		setSelectedMeditation(null);
		setIsCustomTimer(true);
		setShowSteps(false);
	};

	const getCurrentMeditation = () => {
		return standardMeditations.find((m) => m.id === selectedMeditation);
	};

	const startMeditation = () => {
		// Set up the timer based on selected meditation or custom duration
		let duration = isCustomTimer
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

		// Hide steps when timer starts
		setShowSteps(false);
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
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
			{/* Navbar with hide/show on scroll */}
			<div
				className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
					scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
				}`}
			>
				<Navbar />
			</div>

			{/* Main content */}
			<div className="w-full max-w-6xl px-4 py-8 pt-20 mx-auto">
				<h1 className="mb-2 text-3xl font-bold text-center text-blue-700">
					Mindfulness Meditation
				</h1>
				<p className="mb-8 text-center text-gray-600">
					Take a moment to breathe, focus, and find your calm center
				</p>

				{/* Active Timer - Shown when meditation is in progress */}
				{timerActive && (
					<div className="flex flex-col items-center p-6 mb-10 bg-white border border-blue-100 shadow-lg rounded-xl">
						<div className="relative flex items-center justify-center w-64 h-64 mb-6 border-8 border-blue-100 rounded-full">
							{/* Progress ring */}
							<svg
								className="absolute inset-0 w-full h-full -rotate-90"
								viewBox="0 0 100 100"
							>
								<circle
									cx="50"
									cy="50"
									r="46"
									stroke="#EBF5FF"
									strokeWidth="8"
									fill="none"
								/>
								<circle
									cx="50"
									cy="50"
									r="46"
									stroke="#3B82F6"
									strokeWidth="8"
									fill="none"
									strokeDasharray="289.03"
									strokeDashoffset={
										289.03 * (timeRemaining / totalTime)
									}
									strokeLinecap="round"
									className="transition-all duration-1000"
								/>
							</svg>

							{/* Timer display */}
							<div className="text-center">
								<div className="text-5xl font-bold text-blue-700">
									{formatTime(timeRemaining)}
								</div>
								<div className="mt-1 text-blue-600">Remaining</div>
							</div>
						</div>

						{/* Meditation name */}
						<h2 className="mb-8 text-xl font-semibold text-gray-800">
							{isCustomTimer
								? 'Custom Meditation'
								: getCurrentMeditation()?.name}
						</h2>

						{/* Timer controls */}
						<div className="flex space-x-4">
							{isPaused ? (
								<button
									onClick={resumeTimer}
									className="flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Resume
								</button>
							) : (
								<button
									onClick={pauseTimer}
									className="flex items-center px-6 py-2 text-white transition-colors rounded-lg shadow-sm bg-amber-500 hover:bg-amber-600"
								>
									<svg
										className="w-5 h-5 mr-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Pause
								</button>
							)}
							<button
								onClick={stopTimer}
								className="flex items-center px-6 py-2 text-white transition-colors bg-red-500 rounded-lg shadow-sm hover:bg-red-600"
							>
								<svg
									className="w-5 h-5 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
								End Session
							</button>
						</div>

						{/* Audio controls */}
						<div className="w-full max-w-md mt-8">
							<div className="flex justify-between mb-2">
								<label className="font-medium text-gray-700">
									Ambient Sound
								</label>
								<span className="text-gray-500">Volume: {volume}%</span>
							</div>
							<div className="grid grid-cols-3 gap-2 mb-3">
								<button
									onClick={() => setAmbientSound('nature')}
									className={`px-3 py-2 text-sm rounded-lg ${
										ambientSound === 'nature'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Nature Sounds
								</button>
								<button
									onClick={() => setAmbientSound('rain')}
									className={`px-3 py-2 text-sm rounded-lg ${
										ambientSound === 'rain'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Gentle Rain
								</button>
								<button
									onClick={() => setAmbientSound('bowls')}
									className={`px-3 py-2 text-sm rounded-lg ${
										ambientSound === 'bowls'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Singing Bowls
								</button>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								value={volume}
								onChange={(e) => setVolume(parseInt(e.target.value))}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
							/>
						</div>
					</div>
				)}

				{/* Meditation Complete Screen */}
				{isMeditationComplete && (
					<div className="p-8 mb-10 text-center bg-white border border-blue-100 shadow-lg rounded-xl">
						<div className="mb-4 text-5xl">✨</div>
						<h2 className="mb-2 text-2xl font-semibold text-blue-700">
							Meditation Complete
						</h2>
						<p className="mb-6 text-gray-600">
							Well done! You've completed your{' '}
							{isCustomTimer
								? customDuration
								: getCurrentMeditation()?.duration}{' '}
							minute meditation.
						</p>
						<button
							onClick={() => {
								setIsMeditationComplete(false);
								if (selectedMeditation) setShowSteps(true);
							}}
							className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
						>
							Return to Meditation Options
						</button>
					</div>
				)}

				{/* Show meditation options when not in active meditation */}
				{!timerActive && !isMeditationComplete && (
					<>
						{/* Meditation Selection */}
						<div className="mb-10">
							<h2 className="mb-4 text-xl font-semibold text-gray-800">
								Choose Your Practice
							</h2>
							<div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
								{standardMeditations.map((meditation) => (
									<div
										key={meditation.id}
										onClick={() => handleMeditationSelect(meditation.id)}
										className={`rounded-xl p-5 text-white cursor-pointer transition-transform hover:scale-105 bg-gradient-to-br ${meditation.bgColor} ${
											selectedMeditation === meditation.id
												? 'ring-4 ring-blue-300'
												: ''
										}`}
									>
										<div className="mb-3 text-4xl">{meditation.icon}</div>
										<h3 className="mb-1 text-xl font-medium">
											{meditation.name}
										</h3>
										<p className="mb-3 text-sm opacity-90">
											{meditation.description}
										</p>
										<div className="flex items-center justify-between">
											<span className="px-2 py-1 text-xs rounded bg-white/20">
												{meditation.duration} mins
											</span>
											<button className="px-3 py-1 text-xs rounded-full bg-white/30 hover:bg-white/40">
												Select
											</button>
										</div>
									</div>
								))}

								{/* Custom Timer Option */}
								<div
									onClick={handleCustomTimerSelect}
									className={`rounded-xl p-5 text-white cursor-pointer transition-transform hover:scale-105 bg-gradient-to-br from-gray-500 to-gray-600 ${
										isCustomTimer ? 'ring-4 ring-blue-300' : ''
									}`}
								>
									<div className="mb-3 text-4xl">⏱️</div>
									<h3 className="mb-1 text-xl font-medium">Custom Timer</h3>
									<p className="mb-3 text-sm opacity-90">
										Set your own meditation duration
									</p>
									<div className="flex items-center justify-between">
										<span className="px-2 py-1 text-xs rounded bg-white/20">
											Flexible
										</span>
										<button className="px-3 py-1 text-xs rounded-full bg-white/30 hover:bg-white/40">
											Select
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Meditation Steps - Shown after selection */}
						{showSteps && selectedMeditation && (
							<div className="p-6 mb-10 bg-white border border-blue-100 shadow-lg rounded-xl">
								<h2 className="flex items-center mb-2 text-xl font-semibold text-gray-800">
									<span className="mr-2">{getCurrentMeditation()?.icon}</span>
									{getCurrentMeditation()?.name} Meditation Steps
								</h2>
								<p className="mb-4 text-gray-600">
									{getCurrentMeditation()?.description}
								</p>

								<ol className="pl-6 mb-6 space-y-2 list-decimal">
									{getCurrentMeditation()?.steps.map((step, index) => (
										<li key={index} className="text-gray-700">
											{step}
										</li>
									))}
								</ol>

								<div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
									<div>
										<p className="text-sm font-medium text-blue-800">
											Recommended Duration
										</p>
										<p className="text-3xl font-bold text-blue-700">
											{getCurrentMeditation()?.duration} minutes
										</p>
									</div>
									<button
										onClick={startMeditation}
										className="flex items-center px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700"
									>
										<svg
											className="w-5 h-5 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Start Meditation
									</button>
								</div>
							</div>
						)}

						{/* Custom Timer Settings */}
						{isCustomTimer && (
							<div className="p-6 mb-10 bg-white border border-blue-100 shadow-lg rounded-xl">
								<h2 className="mb-4 text-xl font-semibold text-gray-800">
									Custom Meditation Timer
								</h2>

								<div className="mb-6">
									<label className="block mb-2 text-gray-700">
										Meditation Duration (minutes)
									</label>
									<div className="flex items-center">
										<button
											onClick={() =>
												setCustomDuration((prev) =>
													Math.max(1, prev - 5)
												)
											}
											className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-l-lg hover:bg-gray-300"
										>
											-5
										</button>
										<button
											onClick={() =>
												setCustomDuration((prev) =>
													Math.max(1, prev - 1)
												)
											}
											className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 hover:bg-gray-300"
										>
											-1
										</button>
										<div className="px-6 py-2 bg-blue-50 font-bold text-2xl text-blue-800 text-center min-w-[100px]">
											{customDuration}
										</div>
										<button
											onClick={() =>
												setCustomDuration((prev) => prev + 1)
											}
											className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 hover:bg-gray-300"
										>
											+1
										</button>
										<button
											onClick={() =>
												setCustomDuration((prev) => prev + 5)
											}
											className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-r-lg hover:bg-gray-300"
										>
											+5
										</button>
									</div>
								</div>

								<div className="flex justify-end p-4 rounded-lg bg-blue-50">
									<button
										onClick={startMeditation}
										className="flex items-center px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700"
									>
										<svg
											className="w-5 h-5 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Start Custom Meditation
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
