import{r as e,t}from"./db.UOc1g-1e.js";function n(){let r=document.getElementById(`loading-state`),i=document.getElementById(`profiles-container`),a=document.getElementById(`empty-state`);if(!r||!i||!a)return;let o=e();if(r.classList.add(`hidden`),o.length===0){i.classList.add(`hidden`),a.classList.remove(`hidden`);return}a.classList.add(`hidden`),i.classList.remove(`hidden`),i.innerHTML=``,o.forEach(e=>{let t=document.createElement(`div`);t.className=`profile-card card animate-fade-in`,t.style.cursor=`pointer`,t.addEventListener(`click`,t=>{t.target.closest(`.delete-btn`)||(window.location.href=`/horoscope?id=${e.id}`)}),t.innerHTML=`
        <div class="profile-info">
          <div class="profile-avatar">
            ${e.name.substring(0,2).toUpperCase()}
          </div>
          <div class="profile-details">
            <h4 class="profile-name">${e.name}</h4>
            <p class="profile-meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${e.birthDate} &nbsp;|&nbsp; 
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${e.birthTime}
            </p>
            <p class="profile-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
              ${e.locationName} (${e.latitude.toFixed(2)}°, ${e.longitude.toFixed(2)}°)
            </p>
          </div>
        </div>
        <button class="delete-btn" aria-label="Delete Profile" data-id="${e.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      `,i.appendChild(t)}),document.querySelectorAll(`.delete-btn`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation();let r=e.currentTarget.getAttribute(`data-id`);r&&confirm(`Are you sure you want to delete this profile?`)&&(t(r),n())})})}n();