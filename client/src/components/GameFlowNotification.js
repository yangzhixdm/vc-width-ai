import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, Users, Trophy } from 'lucide-react';
import './GameFlowNotification.css';

const GameFlowNotification = ({ 
  gameState, 
  showNotification, 
  notificationMessage, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showNotification && notificationMessage) {
      setIsVisible(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showNotification, notificationMessage, onClose]);

  if (!isVisible || !notificationMessage) {
    return null;
  }

  const getNotificationIcon = () => {
    if (notificationMessage.includes('flop')) {
      return <CreditCard size={24} color="white" />;
    } else if (notificationMessage.includes('turn')) {
      return <Clock size={24} color="white" />;
    } else if (notificationMessage.includes('river')) {
      return <Users size={24} color="white" />;
    } else if (notificationMessage.includes('showdown')) {
      return <Trophy size={24} color="white" />;
    }
    return <CreditCard size={24} color="white" />;
  };

  const getNotificationClass = () => {
    if (notificationMessage.includes('flop')) {
      return 'notification-flop';
    } else if (notificationMessage.includes('turn')) {
      return 'notification-turn';
    } else if (notificationMessage.includes('river')) {
      return 'notification-river';
    } else if (notificationMessage.includes('showdown')) {
      return 'notification-showdown';
    }
    return 'notification-default';
  };

  return (
    <div className={`game-flow-notification ${getNotificationClass()}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getNotificationIcon()}
        </div>
        <div className="notification-text">
          <div className="notification-title">
            {notificationMessage.includes('flop') && '翻牌阶段'}
            {notificationMessage.includes('turn') && '转牌阶段'}
            {notificationMessage.includes('river') && '河牌阶段'}
            {notificationMessage.includes('showdown') && '摊牌阶段'}
            {!notificationMessage.includes('flop') && 
             !notificationMessage.includes('turn') && 
             !notificationMessage.includes('river') && 
             !notificationMessage.includes('showdown') && '游戏进展'}
          </div>
          <div className="notification-message">
            {notificationMessage}
          </div>
        </div>
        <button 
          className="notification-close"
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default GameFlowNotification;
