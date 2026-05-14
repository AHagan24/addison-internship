import React from "react";

const Countdown = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    const interval = setInterval(() => {
      const distance = expiryDate - Date.now();

      if (distance <= 0) {
        setTimeLeft("");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!timeLeft) {
    return null;
  }

  return <div className="de_countdown">{timeLeft}</div>;
};

export default Countdown;
