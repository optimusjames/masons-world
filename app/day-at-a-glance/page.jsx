'use client';

import { useState } from 'react';
import './styles.css';

export default function DayAtAGlance() {
  const [checkboxes, setCheckboxes] = useState({
    0: true,
    1: false,
    2: false,
    3: false
  });

  const toggleCheckbox = (index) => {
    setCheckboxes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="day-container">
      <header>
        <h1>Your day at<br />a glance</h1>
        <p className="subtitle">Easily view your scheduled time blocks<br />in a clean and efficient timeline format.</p>
      </header>

      <div className="timeline">
        <div className={`hour-row ${checkboxes[0] ? 'past' : ''}`}>
          <div className="hour-col">
            <span className="hour-num">07</span>
          </div>
          <div className="bar-col">
            <div className="event-bar past">
              <svg viewBox="0 0 24 24">
                <path d="M4 17l4-4 4 4 8-8" />
                <path d="M4 17h4v4" />
              </svg>
            </div>
          </div>
          <div className="card-col">
            <div className="event-card">
              <div className="event-details">
                <div className="event-title">Morning Workout</div>
                <div className="event-time">07:00 – 08:00 (1 hr)</div>
              </div>
              <div
                className={`checkbox ${checkboxes[0] ? 'checked' : ''}`}
                onClick={() => toggleCheckbox(0)}
              />
            </div>
          </div>
        </div>

        <div className="hour-row">
          <div className="hour-col">
            <span className="hour-num">08</span>
          </div>
          <div className="bar-col">
            <div className="event-bar split shower">
              <svg viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
          </div>
          <div className="card-col">
            <div className="event-card">
              <div className="event-details">
                <div className="event-title">Shower</div>
                <div className="event-time">08:00 – 09:00 (1 hr)</div>
              </div>
              <div
                className={`checkbox blue ${checkboxes[1] ? 'checked' : ''}`}
                onClick={() => toggleCheckbox(1)}
              />
            </div>
          </div>
        </div>

        <div className="now-line" style={{ top: '147px' }}></div>

        <div className="hour-row">
          <div className="hour-col">
            <span className="hour-num">09</span>
          </div>
          <div className="bar-col">
            <div className="event-bar breakfast">
              <svg viewBox="0 0 24 24">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              </svg>
            </div>
          </div>
          <div className="card-col">
            <div className="event-card">
              <div className="event-details">
                <div className="event-title">Breakfast</div>
                <div className="event-time">09:00 – 10:00 (1 hr)</div>
              </div>
              <div
                className={`checkbox yellow ${checkboxes[2] ? 'checked' : ''}`}
                onClick={() => toggleCheckbox(2)}
              />
            </div>
          </div>
        </div>

        <div className="hour-row">
          <div className="hour-col">
            <span className="hour-num">10</span>
          </div>
          <div className="bar-col">
            <div className="event-bar email">
              <svg viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          </div>
          <div className="card-col">
            <div className="event-card">
              <div className="event-details">
                <div className="event-title">Check Email</div>
                <div className="event-time">10:00 – 11:00 (1 hr)</div>
              </div>
              <div
                className={`checkbox purple ${checkboxes[3] ? 'checked' : ''}`}
                onClick={() => toggleCheckbox(3)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
