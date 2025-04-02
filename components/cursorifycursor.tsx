  {/* Click Burst Effect */}
  {clickBurst && (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: clickBurst.x,
        top: clickBurst.y,
        transform: 'translate(-50%, -50%)',
        animation: 'burst 0.5s ease-out forwards'
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 90%)'
            : 'radial-gradient(circle, rgba(236, 230, 230, 0.2) 0%, rgba(233, 229, 238, 0.1) 50%, transparent 70%)',
          boxShadow: theme === 'dark'
            ? '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.6), 0 0 120px rgba(255,255,255,0.4)'
            : '0 0 15px rgba(0,243,255,0.2), 0 0 30px rgba(125,0,255,0.1)',
          animation: 'burst-glow 0.5s ease-out forwards'
        }}
      />
    </div>
  )}

  {/* Particles */}
  {particles.map((particle, index) => (
    <div
      key={index}
      className="absolute pointer-events-none"
      style={{
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        background: theme === 'dark'
          ? 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.8))'
          : 'radial-gradient(circle, rgba(0,243,255,0.4), rgba(125,0,255,0.2))',
        borderRadius: '50%',
        opacity: particle.opacity,
        transform: 'translate(-50%, -50%)',
        boxShadow: theme === 'dark'
          ? '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)'
          : '0 0 5px rgba(0,243,255,0.3), 0 0 10px rgba(125,0,255,0.2)'
      }}
    />
  ))}

  <style jsx>{`
    @keyframes burst {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
      }
    }

    @keyframes burst-glow {
      0% {
        opacity: 1;
        filter: brightness(1.5);
      }
      100% {
        opacity: 0;
        filter: brightness(1);
      }
    }
  `}</style> 