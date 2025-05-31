document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('background-music');
    const musicButton = document.getElementById('music-toggle-button');
    const fallingItemsContainer = document.getElementById('falling-items-container');
    let userInteracted = false;
    let fallingInterval; // Biến để kiểm soát interval cho hiệu ứng rơi

    // --- Điều khiển nhạc nền ---
    function toggleMusic() {
        if (!userInteracted) { // Cho phép autoplay sau tương tác đầu tiên
            userInteracted = true;
            if (music) { // Kiểm tra music tồn tại
                music.play().catch(e => console.log("Trình duyệt chặn tự động phát nhạc:", e));
            }
        }

        if (music && music.paused) {
            music.play().catch(e => console.log("Lỗi phát nhạc:", e));
            if (musicButton) {
                musicButton.textContent = '❚❚';
                musicButton.setAttribute('aria-label', 'Tạm dừng nhạc');
            }
        } else if (music) {
            music.pause();
            if (musicButton) {
                musicButton.textContent = '▶';
                musicButton.setAttribute('aria-label', 'Phát nhạc');
            }
        }
    }
    if (musicButton) musicButton.addEventListener('click', toggleMusic);

    function attemptAutoplayOnFirstInteraction() {
        if (!userInteracted && music && music.paused) {
            userInteracted = true;
            music.play().then(() => {
                if (musicButton) {
                    musicButton.textContent = '❚❚';
                    musicButton.setAttribute('aria-label', 'Tạm dừng nhạc');
                }
            }).catch(e => {
                // console.log("Autoplay bị chặn, cần click nút nhạc.");
            });
        }
        // Gỡ bỏ listener này sau lần tương tác đầu tiên
        document.body.removeEventListener('click', attemptAutoplayOnFirstInteraction);
        document.body.removeEventListener('keydown', attemptAutoplayOnFirstInteraction);
    }
    document.body.addEventListener('click', attemptAutoplayOnFirstInteraction);
    document.body.addEventListener('keydown', attemptAutoplayOnFirstInteraction);


    // --- Hiệu ứng rơi ---
    const itemTypes = [
        { content: '❤', class: 'heart' },
        { content: '🌸', class: 'flower' },
        { content: '💖', class: 'heart' },
        { content: '✨', class: 'flower' },
        { content: '🧸', class: 'bear' },
        { content: '🌈', class: 'rainbow' },
        { content: '⭐', class: 'star' },
        { content: '🍓', class: 'strawberry' },
        { content: '🦄', class: 'unicorn' }
    ];
    const numFallingItemsPerInterval = 1; // Số item tạo ra mỗi interval
    const intervalTime = 800; // Thời gian giữa mỗi lần tạo item (ms)

    function createFallingItem() {
        if (document.hidden || !fallingItemsContainer) return; // Không tạo item nếu tab không active hoặc container không tồn tại

        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const item = document.createElement('div');
        item.classList.add('falling-item', itemType.class);
        item.textContent = itemType.content;

        item.style.left = `${Math.random() * 100}vw`;
        const animationDuration = Math.random() * 5 + 5; // 5-10 giây
        item.style.animationDuration = `${animationDuration}s`;
        item.style.fontSize = `${Math.random() * 1 + 0.8}rem`; // Kích thước ngẫu nhiên
        item.style.animationDelay = `${Math.random() * 0.5}s`; // Trễ ngẫu nhiên nhẹ

        fallingItemsContainer.appendChild(item);

        setTimeout(() => {
            item.remove();
        }, (animationDuration + parseFloat(item.style.animationDelay || 0)) * 1000 + 200); // Thêm chút buffer
    }

    function startFallingEffect() {
        if (fallingInterval) clearInterval(fallingInterval);
        // Tạo một vài item ban đầu cho có không khí
        for(let i = 0; i < 5; i++) {
            setTimeout(createFallingItem, Math.random() * 1000);
        }
        fallingInterval = setInterval(createFallingItem, intervalTime);
    }

    function stopFallingEffect() {
        if (fallingInterval) clearInterval(fallingInterval);
        // Optional: Xóa các item đang rơi nếu muốn dừng hẳn
        // if (fallingItemsContainer) {
        //     const currentFallingItems = fallingItemsContainer.querySelectorAll('.falling-item');
        //     currentFallingItems.forEach(item => item.remove());
        // }
    }
    if (fallingItemsContainer) startFallingEffect();


    // --- Hiệu ứng click chuột & trái tim bay lên ---
    document.body.addEventListener('click', (event) => {
        // Không tạo hiệu ứng nếu click vào nút nhạc, hoặc bên trong modal đang mở
        const modal = document.getElementById('final-letter-modal');
        if (event.target === musicButton || (musicButton && musicButton.contains(event.target)) ||
            (modal && modal.style.display === 'block' && modal.contains(event.target))) {
            return;
        }
        // Hiệu ứng sparkle
        const sparkle = document.createElement('div');
        sparkle.className = 'click-sparkle';
        document.body.appendChild(sparkle);
        sparkle.style.left = `${event.clientX}px`;
        sparkle.style.top = `${event.clientY}px`;
        sparkle.addEventListener('animationend', () => {
            sparkle.remove();
        });
        // Hiệu ứng trái tim bay lên (dễ thương hơn)
        const flying = document.createElement('div');
        flying.className = 'flying-heart sparkle-heart';
        const flyingIcons = ['💗','💖','🧸','🌸','⭐','🍓','🦄'];
        flying.textContent = flyingIcons[Math.floor(Math.random()*flyingIcons.length)];
        document.body.appendChild(flying);
        flying.style.left = `${event.clientX - 10}px`;
        flying.style.top = `${event.clientY - 10}px`;
        setTimeout(() => flying.remove(), 1400);
    });


    // --- XỬ LÝ MODAL LÁ THƯ CUỐI ---
    const modal = document.getElementById('final-letter-modal');
    const revealButton = document.getElementById('reveal-letter-trigger');
    const closeButton = document.getElementById('close-modal-button');
    let modalAnimated = false; // Lưu trạng thái đã hiện hiệu ứng lần đầu

    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            if (musicButton) musicButton.style.display = 'none';
            stopFallingEffect();
            // --- Hiệu ứng gõ chữ cho tiêu đề modal ---
            const modalTypingTitle = document.getElementById('modal-typing-title');
            if (modalTypingTitle) {
                const titleText = 'Tình cảm của anh';
                modalTypingTitle.textContent = '';
                let i = 0;
                function typeTitle() {
                    if (i <= titleText.length) {
                        modalTypingTitle.textContent = titleText.slice(0, i);
                        i++;
                        setTimeout(typeTitle, 60);
                    }
                }
                if (!modalAnimated) typeTitle();
                else modalTypingTitle.textContent = titleText;
            }
            // --- Hiển thị từng dòng nội dung và nút call lần lượt hoặc hiện luôn ---
            const letterBody = modal.querySelector('.letter-body');
            const callBtn = modal.querySelector('.contact-link');
            if (letterBody) {
                const paragraphs = Array.from(letterBody.querySelectorAll('p'));
                const ems = Array.from(letterBody.querySelectorAll('em'));
                if (!modalAnimated) {
                    paragraphs.forEach(p => { p.style.opacity = '0'; p.style.height = '0'; p.style.overflow = 'hidden'; });
                    ems.forEach(em => { em.style.opacity = '0'; em.style.height = '0'; em.style.overflow = 'hidden'; });
                    if (callBtn) { callBtn.style.opacity = '0'; callBtn.style.height = '0'; callBtn.style.overflow = 'hidden'; }
                    let idx = 0;
                    function showNextPara() {
                        if (idx < paragraphs.length) {
                            const p = paragraphs[idx];
                            let text = p.getAttribute('data-original') || p.textContent;
                            if (!p.getAttribute('data-original')) p.setAttribute('data-original', text);
                            p.textContent = '';
                            p.style.transition = 'opacity 0.7s, height 0.7s';
                            p.style.opacity = '1';
                            p.style.height = '';
                            let charIdx = 0;
                            function typeCharPara() {
                                if (charIdx <= text.length) {
                                    p.textContent = text.slice(0, charIdx);
                                    charIdx++;
                                    setTimeout(typeCharPara, 18);
                                } else {
                                    idx++;
                                    setTimeout(showNextPara, 250);
                                }
                            }
                            typeCharPara();
                        } else if (ems.length > 0) {
                            // Sau khi các đoạn <p> xong thì hiện <em> cuối cùng
                            let emIdx = 0;
                            function showEm() {
                                if (emIdx < ems.length) {
                                    const em = ems[emIdx];
                                    let text = em.getAttribute('data-original') || em.textContent;
                                    if (!em.getAttribute('data-original')) em.setAttribute('data-original', text);
                                    em.textContent = '';
                                    em.style.transition = 'opacity 0.7s, height 0.7s';
                                    em.style.opacity = '1';
                                    em.style.height = '';
                                    let charIdx = 0;
                                    function typeCharEm() {
                                        if (charIdx <= text.length) {
                                            em.textContent = text.slice(0, charIdx);
                                            charIdx++;
                                            setTimeout(typeCharEm, 18);
                                        } else {
                                            emIdx++;
                                            setTimeout(showEm, 200);
                                        }
                                    }
                                    typeCharEm();
                                } else {
                                    // Hiện nút call sau cùng
                                    if (callBtn) {
                                        callBtn.style.transition = 'opacity 0.7s, height 0.7s';
                                        callBtn.style.opacity = '1';
                                        callBtn.style.height = '';
                                    }
                                    modalAnimated = true; // Đánh dấu đã hiện hiệu ứng
                                }
                            }
                            showEm();
                        } else {
                            // Nếu không có <em>, hiện nút call luôn
                            if (callBtn) {
                                callBtn.style.transition = 'opacity 0.7s, height 0.7s';
                                callBtn.style.opacity = '1';
                                callBtn.style.height = '';
                            }
                            modalAnimated = true; // Đánh dấu đã hiện hiệu ứng
                        }
                    }
                    setTimeout(showNextPara, 800); // Đợi tiêu đề chạy xong một chút
                } else {
                    // Hiện luôn tất cả
                    paragraphs.forEach(p => {
                        let text = p.getAttribute('data-original') || p.textContent;
                        if (!p.getAttribute('data-original')) p.setAttribute('data-original', text);
                        p.textContent = text;
                        p.style.opacity = '1';
                        p.style.height = '';
                        p.style.overflow = '';
                    });
                    ems.forEach(em => {
                        let text = em.getAttribute('data-original') || em.textContent;
                        if (!em.getAttribute('data-original')) em.setAttribute('data-original', text);
                        em.textContent = text;
                        em.style.opacity = '1';
                        em.style.height = '';
                        em.style.overflow = '';
                    });
                    if (callBtn) {
                        callBtn.style.opacity = '1';
                        callBtn.style.height = '';
                        callBtn.style.overflow = '';
                    }
                }
            }
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            if (musicButton) musicButton.style.display = 'flex'; // Hiện lại nút nhạc
            startFallingEffect(); // Khởi động lại hiệu ứng rơi
            // Không tự động phát lại nhạc, để người dùng tự quyết định
        }
    }

    if (revealButton) {
        revealButton.addEventListener('click', openModal);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    console.log("Trang web tỏ tình đã sẵn sàng với lá thư cuối!");

    // Đếm ngày yêu (ví dụ: từ 14/02/2024)

});

