import { Logo } from "./Logo";

interface LoadingLogoProps {
	progress: number;
}

export default function LoadingLogo({ progress }: LoadingLogoProps) {
	return (
		<div className="relative w-64 h-64">
			{/* Semi-transparent base SVG */}
			<div className="absolute inset-0 opacity-30">
				<Logo className="w-full h-full" />
			</div>

			{/* Mask container for fill animation - reveals from bottom to top */}
			<div
				className="absolute inset-0 overflow-hidden transition-all duration-300 ease-out"
				style={{
					clipPath: `inset(${100 - progress}% 0 0 0)`
				}}
			>
				{/* Full opacity SVG that gets revealed */}
				<Logo className="w-full h-full" />
			</div>

			{/* Progress percentage text */}
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-white text-2xl font-bold drop-shadow-lg" style={{ mixBlendMode: 'difference' }}>
					{Math.round(progress)}%
				</span>
			</div>
		</div>
	);
}
