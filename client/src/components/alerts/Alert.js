import React, { useState } from 'react';
import './index.scss';

export default function Alert({
  isActive,
  title = 'Заголовок',
  description = 'Описание',
  onChangeAlert
}) {
  return (
    <>
      <div className={isActive ? 'alert alert_active' : 'alert'}>
        <div className='alert__wrapper'>
          <p className='alert__title'>{title}</p>
          <p className='alert__description'>{description}</p>
        </div>
      </div>
      <div
        onClick={() => {
          onChangeAlert(false);
        }}
        className={
          isActive ? 'alert__overlay alert__overlay_active' : 'alert__overlay'
        }
      ></div>
    </>
  );
}
