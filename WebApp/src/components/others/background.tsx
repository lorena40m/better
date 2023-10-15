import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const createCircle = (existingCircles, canvas) => {
  let maxAttempts = 50;
  let created = false;
  let newCircle;

  const randomColor = () => {
	const color1 = [235, 116, 116];
	const color2 = [79, 130, 202];
	const ratio = Math.random();
	const color = color1.map((start, i) => Math.round(start + (color2[i] - start) * ratio));
	return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`;
  };
  
  while (maxAttempts > 0 && !created) {
    newCircle = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5),
      dy: (Math.random() - 0.5),
      radius: Math.random() * 200 + 320,
	  color: randomColor(),
    };

    let overlapping = false;

    for (let existing of existingCircles) {
      let dist = Math.hypot(existing.x - newCircle.x, existing.y - newCircle.y);
      if (dist < existing.radius + newCircle.radius) {
        overlapping = true;
        break;
      }
    }

    if (!overlapping) {
      created = true;
    }

    maxAttempts--;
  }

  if (created) {
    return newCircle;
  } else {
    return null;
  }
};

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    let requestAnimationId;

    const circles = [];

    for (let i = 0; i < 2; i++) {
      const newCircle = createCircle(circles, canvas);
      if (newCircle) {
        circles.push(newCircle);
      }
    }

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      let i = 0;
      for (let circle of circles) {
        i++;
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        context.fillStyle = i % 2 === 0 ? 'rgba(235,116, 116, 0.5)' : 'rgba(79,130,202,0.5)';
        context.fill();
        context.filter = 'blur(30px)';
        context.stroke();

        if (
          circle.x + circle.radius > canvas.width ||
          circle.x - circle.radius < 0
        ) {
          circle.dx = -circle.dx;
        }

        if (
          circle.y + circle.radius > canvas.height ||
          circle.y - circle.radius < 0
        ) {
          circle.dy = -circle.dy;
        }

        circle.x += circle.dx;
        circle.y += circle.dy;
      }

      requestAnimationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(requestAnimationId);
  }, []);

  return (
    <Box className="backgroundBox">
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default Background;
