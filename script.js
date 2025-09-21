// Sparkles on mouse move
document.addEventListener("mousemove", e => {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    const size = Math.random() * 6 + 4;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.background = "#ffffff";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 600);
});

// Sparkles falling effect
const sparkleContainer = document.getElementById('sparkles-container');
function createFallingSparkle() {
    const sparkle = document.createElement('div');
    sparkle.classList.add('falling-sparkle');
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    const size = Math.random() * 4 + 4;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    sparkle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    sparkleContainer.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
}
setInterval(createFallingSparkle, 200);

// Intro click to enter site
const music = document.getElementById("bg-music");
const volumeSlider = document.getElementById("volume");
const volumeFill = document.getElementById("volume-fill");
music.volume = volumeSlider.value;
volumeFill.style.width = volumeSlider.value * 100 + "%";
volumeSlider.addEventListener("input", e => {
    const val = e.target.value;
    music.volume = val;
    volumeFill.style.width = val * 100 + "%";
});
document.getElementById('enter-btn').addEventListener('click', () => {
    const intro = document.getElementById('intro');
    intro.style.opacity = '0';
    setTimeout(() => {
        intro.style.display = 'none';
        document.getElementById('main').style.display = 'block';
        music.play().catch(err => console.log('User interaction needed', err));
    }, 800);
});
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.member, .members').forEach(profile => {
        profile.addEventListener('click', function(e) {
            const song = profile.getAttribute('data-song');
            if (song) {
                audio.src = song;
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        });
    });
});

// Modal elements
const cardModal = document.getElementById('cardModal');
const cardAvatar = document.getElementById('cardAvatar');
const cardName = document.getElementById('cardName');
const cardStatusDot = document.getElementById('cardStatusDot');
const cardStatusText = document.getElementById('cardStatusText');
const cardRole = document.getElementById('cardRole');
const cardSocials = document.getElementById('cardSocials');
const cardActivities = document.getElementById('cardActivities');
const cardBanner = document.getElementById('cardBanner');
// Shawty card modal elements
const shawtyCardModal = document.getElementById('shawtyCardModal');
const shawtyCardBanner = document.getElementById('shawtyCardBanner');
const shawtyCardAvatar = document.getElementById('shawtyCardAvatar');
const shawtyCardStatusDot = document.getElementById('shawtyCardStatusDot');
const shawtyCardName = document.getElementById('shawtyCardName');
const shawtyCardStatusText = document.getElementById('shawtyCardStatusText');
const shawtyCardRole = document.getElementById('shawtyCardRole');
const shawtyCardActivities = document.getElementById('shawtyCardActivities');
const shawtyCardSocials = document.getElementById('shawtyCardSocials');

const attachedMembers = new WeakSet();

// Helper: resolve activity image
function getActivityImage(act) {
    if (!act.assets) return null;
    let image = act.assets.large_image || act.assets.small_image;
    if (!image) return null;
    if (image.startsWith("spotify:")) return `https://i.scdn.co/image/${image.split(":")[1]}`;
    if (image.startsWith("mp:external") || image.startsWith("external")) return image.replace(/^mp:/, "").replace(/^external:/, "");
    if (image.startsWith("mp:")) {
        const cleaned = image.replace("mp:", "");
        return cleaned.startsWith("http") ? cleaned : `https://media.discordapp.net/${cleaned}`;
    }
    return `https://cdn.discordapp.com/app-assets/${act.application_id}/${image}.png`;
}

// Fetch Discord status/profile using Lanyard
async function updateMembers() {
    const members = document.querySelectorAll('.member');
    for (let member of members) {
        const userId = member.getAttribute('data-user');
        const guildAttr = member.getAttribute('data-guild') || "";
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
            if (!res.ok) continue;
            const data = await res.json();
            const user = data.data.discord_user;
            const status = data.data.discord_status;
            const activities = data.data.activities || [];
            const primaryGuild = data.data.primary_guild;
            const guildTag = primaryGuild?.tag || '';

            // Avatar
            const avatarHash = user.avatar;
            const avatarURL = avatarHash
                ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.png?size=256`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
            member.querySelector('img').src = avatarURL;

            const customName = member.getAttribute('data-name');
            member.querySelector('.name').textContent = customName || user.username;

            const guildDiv = member.querySelector('.guild-tag');
            if (guildDiv) guildDiv.textContent = guildTag ? ` [${guildTag}]` : '';

            // Status dot only (no text in member list)
            const dot = member.querySelector('.status-dot');
            dot.style.background =
                status === "online" ? "#43b581" :
                    status === "idle" ? "#faa61a" :
                        status === "dnd" ? "#f04747" : "gray";

            // Remove status text from member list if exists
            const statusText = member.querySelector('.status-text');
            if (statusText) statusText.remove();

            // Mobile icon
            const clientStatus = data.data.client_status || {};
            const isMobileOnline = clientStatus.mobile && status === "online";
            let mobileIcon = member.querySelector('.mobile-icon');
            if (!mobileIcon) {
                mobileIcon = document.createElement('img');
                mobileIcon.className = 'mobile-icon';
                mobileIcon.src = 'path/to/discord-mobile-icon.svg';
                mobileIcon.style.width = "14px";
                mobileIcon.style.height = "14px";
                mobileIcon.style.marginLeft = "4px";
                member.querySelector('.name').after(mobileIcon);
            }
            mobileIcon.style.display = isMobileOnline ? 'inline-block' : 'none';

            // Attach modal click handler once
            if (!attachedMembers.has(member)) {
                member.style.cursor = 'pointer';
                member.addEventListener('click', async () => {
                    console.log("Opening modal for:", userId);
                    cardModal.classList.add('show');
                    
                    try {
                        const clickRes = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
                        const clickData = await clickRes.json();
                        const clickUser = clickData.data.discord_user;
                        const clickStatus = clickData.data.discord_status;
                        const activities = clickData.data.activities || [];
                        const guildTagClick = clickData.data.primary_guild?.tag || '';

                        const avatarHashClick = clickUser.avatar;
                        const avatarURLClick = avatarHashClick
                            ? `https://cdn.discordapp.com/avatars/${clickUser.id}/${avatarHashClick}.png?size=256`
                            : `https://cdn.discordapp.com/embed/avatars/${parseInt(clickUser.discriminator) % 5}.png`;
                        cardAvatar.src = avatarURLClick;

                        // Avatar decoration frame
                        const decoData = clickUser.avatar_decoration_data;
                        if (decoData && decoData.asset) {
                            const frameURL = `https://cdn.discordapp.com/avatar-decoration-presets/${decoData.asset}.png?size=128`;
                            let frameImg = document.getElementById('cardAvatarFrame');
                            if (!frameImg) {
                                frameImg = document.createElement('img');
                                frameImg.id = 'cardAvatarFrame';
                                frameImg.style.position = 'absolute';
                                frameImg.style.width = cardAvatar.offsetWidth + 'px';
                                frameImg.style.height = cardAvatar.offsetHeight + 'px';
                                frameImg.style.left = cardAvatar.offsetLeft + 'px';
                                frameImg.style.top = cardAvatar.offsetTop + 'px';
                                frameImg.style.pointerEvents = 'none';
                                cardAvatar.parentNode.style.position = 'relative';
                                cardAvatar.parentNode.appendChild(frameImg);
                            }
                            frameImg.src = frameURL;
                        } else {
                            const oldFrame = document.getElementById('cardAvatarFrame');
                            if (oldFrame) oldFrame.remove();
                        }

                        cardName.textContent = `${customName || clickUser.username}${guildTagClick ? ` [${guildTagClick}]` : ''}`;

                        // Always show base status in modal
                        let baseStatus =
                            clickStatus === "online" ? "🟢 Online" :
                                clickStatus === "idle" ? "🌙 Idle" :
                                    clickStatus === "dnd" ? "⛔ Do Not Disturb" : "⚪ Offline";

                        cardStatusDot.style.background =
                            clickStatus === "online" ? "#43b581" :
                                clickStatus === "idle" ? "#faa61a" :
                                    clickStatus === "dnd" ? "#f04747" : "gray";

                        // Show base status + optional custom status (no "Custom Status" label)
                        const customStatus = activities.find(a => a.type === 4);
                        if (customStatus) {
                            let emoji = "";
                            if (customStatus.emoji) {
                                emoji = customStatus.emoji.id
                                    ? `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}"gif" : "png" style="width:16px;height:16px;vertical-align:middle;"> `
                                    : customStatus.emoji.name + " ";
                            }
                            cardStatusText.innerHTML = `${baseStatus}<br>${emoji}${customStatus.state || ""}`;
                        } else {
                            cardStatusText.innerHTML = baseStatus;
                        }

                        cardRole.textContent = member.querySelector('.role')?.textContent || '';

                        // Activities
                        cardActivities.innerHTML = '';
                        if (activities.length > 0) {
                            activities.forEach(act => {
                                if (act.type === 4) return; // skip custom status here
                                const div = document.createElement('div');
                                div.className = 'activity-card';
                                const imgUrl = getActivityImage(act);
                                const title = act.name || "Activity";
                                const details = act.image || act.details || act.state || "";

                                // create structure first
                                div.innerHTML = `
            ${imgUrl ? `<img class="activity-thumb" src="${imgUrl}">` : ""}
            <div class="activity-info">
                <div class="activity-name">${title}</div>
                ${details ? `<div class="activity-details">${details}</div>` : ""}
                <div class="activity-time"></div>
            </div>
        `;

                                const timeEl = div.querySelector('.activity-time');

                                function updateTime() {
                                    if (!act.timestamps) return;
                                    let timeInfo = "";

                                    if (act.timestamps.start) {
                                        const elapsed = Math.floor((Date.now() - act.timestamps.start) / 1000);
                                        const mins = Math.floor(elapsed / 60);
                                        const secs = elapsed % 60;
                                        timeInfo = `🎮: ${mins}m ${secs < 10 ? "0" + secs : secs}s`;
                                    }

                                    if (act.timestamps.end) {
                                        const remaining = Math.floor((act.timestamps.end - Date.now()) / 1000);
                                        if (remaining > 0) {
                                            const mins = Math.floor(remaining / 60);
                                            const secs = remaining % 60;
                                            timeInfo = `⏳: ${mins}m ${secs < 10 ? "0" + secs : secs}s`;
                                        }
                                    }

                                    timeEl.innerHTML = timeInfo;
                                }

                                // initial + auto-update
                                updateTime();
                                setInterval(updateTime, 1000);

                                cardActivities.appendChild(div);
                            });
                        } else {
                            cardActivities.innerHTML = `<div class="activity-empty">No current activity</div>`;
                        }


                        // Socials
                        cardSocials.innerHTML = '';
                        const link = member.getAttribute('data-link');
                        if (link) {
                            const a = document.createElement('a');
                            a.href = link;
                            a.target = '_blank';
                            a.className = 'chip';
                            a.textContent = '▶️ YouTube';
                            cardSocials.appendChild(a);
                        }
                        const socialsAttr = member.getAttribute('data-socials');
                        if (socialsAttr) {
                            socialsAttr.split(',').map(u => u.trim()).forEach(url => {
                                const a = document.createElement('a');
                                a.href = url;
                                a.target = '_blank';
                                a.className = 'chip';
                                a.textContent = url.includes("guns.lol") ? "🔫" : "🌐 Link";
                                cardSocials.appendChild(a);
                            });
                        }
                        const fullProf = member.getAttribute('data-fullprofile');
                        if (fullProf) {
                            const a = document.createElement('a');
                            a.href = fullProf.trim();
                            a.target = '_blank';
                            a.className = 'chip';
                            a.textContent = "🌐 Link";
                            cardSocials.appendChild(a);
                        }

                        // Banner (manual)
                        cardBanner.style.backgroundImage = "linear-gradient(135deg, #2c2c2c, #232323)";
                        const customBanner = member.getAttribute('data-banner');
                        if (customBanner) {
                            cardBanner.style.backgroundImage = `url(${customBanner})`;
                            cardBanner.style.backgroundSize = "cover";
                            cardBanner.style.backgroundPosition = "center";
                        }
                    } catch (err) {
                        console.error("Error loading profile:", err);
                    }
                });
                attachedMembers.add(member);
            }

        } catch (e) {
            console.error("Error fetching user", userId, e);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateMembers();
    setInterval(updateMembers, 15000);
});

// Close modal
cardModal.addEventListener('click', e => { if (e.target === cardModal) cardModal.classList.remove('show'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') cardModal.classList.remove('show'); });

// ShawtyzCards
async function updateShawtyCards() {
    // Select all .shawtyz .members
    const members = document.querySelectorAll('.shawtyz .members');
    for (let member of members) {
        const userId = member.getAttribute('data-user');
        if (!userId) continue;
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
            if (!res.ok) continue;
            const data = await res.json();
            const user = data.data.discord_user;
            const status = data.data.discord_status;
            const activities = data.data.activities || [];
            const primaryGuild = data.data.primary_guild;
            const guildTag = primaryGuild?.tag || '';

            // Avatar
            const avatarHash = user.avatar;
            const avatarURL = avatarHash
                ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.png?size=256`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
            member.querySelector('img').src = avatarURL;

            // Name
            const customName = member.getAttribute('data-name');
            member.querySelector('.name').textContent = customName || user.username;

            // Guild tag
            const guildDiv = member.querySelector('.guild-tag');
            if (guildDiv) guildDiv.textContent = guildTag ? ` [${guildTag}]` : '';

            // Status dot
            const dot = member.querySelector('.status-dot');
            dot.style.background =
                status === "online" ? "#43b581" :
                status === "idle" ? "#faa61a" :
                status === "dnd" ? "#f04747" : "gray";
            // Remove status text from member list if exists
            const statusText = member.querySelector('.status-text');
            if (statusText) statusText.remove();

            // Mobile icon
            const clientStatus = data.data.client_status || {};
            const isMobileOnline = clientStatus.mobile && status === "online";
            let mobileIcon = member.querySelector('.mobile-icon');
            if (!mobileIcon) {
                mobileIcon = document.createElement('img');
                mobileIcon.className = 'mobile-icon';
                mobileIcon.src = 'path/to/discord-mobile-icon.svg';
                mobileIcon.style.width = "14px";
                mobileIcon.style.height = "14px";
                mobileIcon.style.marginLeft = "4px";
                member.querySelector('.name').after(mobileIcon);
            }
            mobileIcon.style.display = isMobileOnline ? 'inline-block' : 'none';

            
            // Attach modal click handler once
            if (!member._shawtyModalAttached) {
                member.style.cursor = 'pointer';
                member.addEventListener('click', async () => {
                    shawtyCardModal.classList.add('show');
                    try {
                        const clickRes = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
                        const clickData = await clickRes.json();
                        const clickUser = clickData.data.discord_user;
                        const clickStatus = clickData.data.discord_status;
                        const activities = clickData.data.activities || [];
                        const guildTagClick = clickData.data.primary_guild?.tag || '';

                        const avatarHashClick = clickUser.avatar;
                        const avatarURLClick = avatarHashClick
                            ? `https://cdn.discordapp.com/avatars/${clickUser.id}/${avatarHashClick}.png?size=256`
                            : `https://cdn.discordapp.com/embed/avatars/${parseInt(clickUser.discriminator) % 5}.png`;
                        shawtyCardAvatar.src = avatarURLClick;

                        // Avatar decoration frame for shawtyz modal
                        const decoData = clickUser.avatar_decoration_data;
                        let frameImg = document.getElementById('shawtyAvatarFrame');
                        if (decoData && decoData.asset) {
                            const frameURL = `https://cdn.discordapp.com/avatar-decoration-presets/${decoData.asset}.png?size=128`;
                            if (!frameImg) {
                                frameImg = document.createElement('img');
                                frameImg.id = 'shawtyAvatarFrame';
                                frameImg.style.position = 'absolute';
                                frameImg.style.width = shawtyCardAvatar.offsetWidth + 'px';
                                frameImg.style.height = shawtyCardAvatar.offsetHeight + 'px';
                                frameImg.style.left = shawtyCardAvatar.offsetLeft + 'px';
                                frameImg.style.top = shawtyCardAvatar.offsetTop + 'px';
                                frameImg.style.pointerEvents = 'none';
                                shawtyCardAvatar.parentNode.style.position = 'relative';
                                shawtyCardAvatar.parentNode.appendChild(frameImg);
                            }
                            frameImg.src = frameURL;
                            frameImg.style.display = 'block';
                        } else {
                            if (frameImg) frameImg.remove();
                        }

                        shawtyCardName.textContent = `${customName || clickUser.username}${guildTagClick ? ` [${guildTagClick}]` : ''}`;
                        // Status text
                        let baseStatus =
                            clickStatus === "online" ? "🟢 Online" :
                            clickStatus === "idle" ? "🌙 Idle" :
                            clickStatus === "dnd" ? "⛔ Do Not Disturb" : "⚪ Offline";
                        shawtyCardStatusText.textContent = baseStatus;

                        // Status dot
                        shawtyCardStatusDot.style.background =
                            clickStatus === "online" ? "#43b581" :
                            clickStatus === "idle" ? "#faa61a" :
                            clickStatus === "dnd" ? "#f04747" : "gray";

                        // Show base status + optional custom status (no "Custom Status" label)
                        const customStatus = activities.find(a => a.type === 4);
                        if (customStatus) {
                            let emoji = "";
                            if (customStatus.emoji) {
                                emoji = customStatus.emoji.id
                                    ? `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}"gif" : "png" style="width:16px;height:16px;vertical-align:middle;"> `
                                    : customStatus.emoji.name + " ";
                            }
                            shawtyCardStatusText.innerHTML = `${baseStatus}<br>${emoji}${customStatus.state || ""}`;
                        } else {
                            shawtyCardStatusText.innerHTML = baseStatus;
                        }
                

                        shawtyCardRole.textContent = member.querySelector('.role')?.textContent || '';

                        // Activities
                        shawtyCardActivities.innerHTML = '';
                        if (activities.length > 0) {
                            activities.forEach(act => {
                                if (act.type === 4) return;
                                const div = document.createElement('div');
                                div.className = 'activity-card';
                                const imgUrl = getActivityImage(act);
                                const title = act.name || "Activity";
                                const details = act.image || act.details || act.state || "";
                                div.innerHTML = `
                                    ${imgUrl ? `<img class="activity-thumb" src="${imgUrl}">` : ""}
                                    <div class="activity-info">
                                        <div class="activity-name">${title}</div>
                                        ${details ? `<div class="activity-details">${details}</div>` : ""}
                                        <div class="activity-time"></div>
                                    </div>
                                `;
                                const timeEl = div.querySelector('.activity-time');
                                function updateTime() {
                                    if (!act.timestamps) return;
                                    let timeInfo = "";
                                    if (act.timestamps.start) {
                                        const elapsed = Math.floor((Date.now() - act.timestamps.start) / 1000);
                                        const mins = Math.floor(elapsed / 60);
                                        const secs = elapsed % 60;
                                        timeInfo = `🎮: ${mins}m ${secs < 10 ? "0" + secs : secs}s`;
                                    }
                                    if (act.timestamps.end) {
                                        const remaining = Math.floor((act.timestamps.end - Date.now()) / 1000);
                                        if (remaining > 0) {
                                            const mins = Math.floor(remaining / 60);
                                            const secs = remaining % 60;
                                            timeInfo = `⏳: ${mins}m ${secs < 10 ? "0" + secs : secs}s`;
                                        }
                                    }
                                    timeEl.innerHTML = timeInfo;
                                }
                                updateTime();
                                setInterval(updateTime, 1000);
                                shawtyCardActivities.appendChild(div);
                            });
                        } else {
                            shawtyCardActivities.innerHTML = `<div class="activity-empty">No current activity</div>`;
                        }

                        // Socials
                        shawtyCardSocials.innerHTML = '';
                        const link = member.getAttribute('data-link');
                        if (link) {
                            const a = document.createElement('a');
                            a.href = link;
                            a.target = '_blank';
                            a.className = 'chip';
                            a.textContent = '▶️ YouTube';
                            shawtyCardSocials.appendChild(a);
                        }
                        const socialsAttr = member.getAttribute('data-socials');
                        if (socialsAttr) {
                            socialsAttr.split(',').map(u => u.trim()).forEach(url => {
                                const a = document.createElement('a');
                                a.href = url;
                                a.target = '_blank';
                                a.className = 'chip';
                                a.textContent = url.includes("guns.lol") ? "🔫" : "🌐 Link";
                                shawtyCardSocials.appendChild(a);
                            });
                        }
                        const fullProf = member.getAttribute('data-fullprofile');
                        if (fullProf) {
                            const a = document.createElement('a');
                            a.href = fullProf.trim();
                            a.target = '_blank';
                            a.className = 'chip';
                            a.textContent = "🌐 Link";
                            shawtyCardSocials.appendChild(a);
                        }

                        // Banner
                        shawtyCardBanner.style.backgroundImage = "linear-gradient(135deg, #ffe6f7, #d1b3ff)";
                        const customBanner = member.getAttribute('data-banner');
                        if (customBanner) {
                            shawtyCardBanner.style.backgroundImage = `url(${customBanner})`;
                            shawtyCardBanner.style.backgroundSize = "cover";
                            shawtyCardBanner.style.backgroundPosition = "center";
                        }
                    } catch (err) {
                        console.error("Error loading shawty profile:", err);
                    }
                });
                attachedMembers.add(members);
            }
        } catch (e) {
            console.error("Error fetching shawty user", userId, e);
        }
    }
}

// Run on DOMContentLoaded and every 15s
document.addEventListener('DOMContentLoaded', () => {
    updateShawtyCards();
    setInterval(updateShawtyCards, 15000);
});

// Close shawty modal on click outside or Escape
shawtyCardModal.addEventListener('click', e => { if (e.target === shawtyCardModal) shawtyCardModal.classList.remove('show'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') shawtyCardModal.classList.remove('show'); });

// Right-click popup & sound
const popup = document.getElementById("popup");
const clickSound = document.getElementById("clickSound");
document.addEventListener("contextmenu", e => {
    e.preventDefault();
    popup.style.left = e.pageX + "px";
    popup.style.top = e.pageY + "px";
    popup.style.display = "block";
    clickSound.currentTime = 0;
    clickSound.play();
    setTimeout(() => popup.style.display = "none", 2000);
});
document.addEventListener("click", () => popup.style.display = "none");

