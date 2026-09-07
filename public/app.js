document.addEventListener('DOMContentLoaded', () => {
    // 1. Extraire le paramètre token de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    const welcomeContainer = document.getElementById('main-greeting');
    const guestNameEl = document.getElementById('guest-name');
    // 2. Si le token est présent, effectuer la requête GET
    if (token) {
        fetch(`/api/invites/${token}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invitation non trouvée ou token invalide');
                }
                return response.json();
            })
            .then(data => {
                // 3. Modifier le DOM dynamiquement avec le prénom
                if (guestNameEl) guestNameEl.textContent = data.prenom;
                if (welcomeContainer) welcomeContainer.classList.remove('hidden');
                if (welcomeContainer) welcomeContainer.classList.add('flex');
            })
            .catch(error => {
                console.error("Erreur lors de la récupération de l'invité:", error);
            });
    } else {
        console.warn("Aucun token d'invitation fourni dans l'URL.");
        // Pour les tests sans token, on affiche quand même la section
        if (guestNameEl) guestNameEl.textContent = "Cher Invité";
        if (welcomeContainer) {
            welcomeContainer.classList.remove('hidden');
            welcomeContainer.classList.add('flex');
        }
    }

    // --- Animation de l'enveloppe et Overlay Couple ---
    const envelopeBtn = document.getElementById('envelope-btn');
    const headerEl = document.querySelector('header');
    const mainContent = document.getElementById('page-2'); // Anciennement main-content
    const page3 = document.getElementById('page-3');
    const animatedNames = document.getElementById('animated-names');
    const overlayNav = document.getElementById('overlay-nav');

    if (envelopeBtn && mainContent) {
        envelopeBtn.addEventListener('click', () => {
            // Masquer le header et afficher le contenu principal
            if (headerEl) headerEl.style.display = 'none';
            mainContent.classList.remove('hidden');
            mainContent.classList.add('flex');
            
            // Pousser l'état dans l'historique
            history.pushState({ page: 2 }, '', '#invitation');

            // Lancer l'animation des prénoms
            setTimeout(() => {
                if (animatedNames) {
                    animatedNames.classList.remove('opacity-0', 'translate-y-10');
                    animatedNames.classList.add('opacity-100', 'translate-y-0');
                }
            }, 100);

            // Afficher les boutons de navigation
            setTimeout(() => {
                if (overlayNav) {
                    overlayNav.classList.remove('opacity-0');
                    overlayNav.classList.add('opacity-100');
                }
            }, 600);

            // Lancer l'effet des pétales de fleurs
            const createPetal = () => {
                const petalsContainer = document.getElementById('petals-container');
                if (!petalsContainer) return;
                
                const petal = document.createElement('div');
                petal.classList.add('petal');
                
                // Random properties for natural look
                const size = Math.random() * 12 + 10; // 10px to 22px
                const left = Math.random() * 100; // 0 to 100%
                const duration = Math.random() * 3 + 3; // 3s to 6s
                const delay = Math.random() * 1;
                
                petal.style.width = `${size}px`;
                petal.style.height = `${size}px`;
                petal.style.left = `${left}%`;
                petal.style.animationDuration = `${duration}s`;
                petal.style.animationDelay = `${delay}s`;
                
                // Random petal colors (bleu et blanc)
                const colors = ['#ffffff', '#cce6fa', '#a5c7e4', '#90b4d4', '#eef4fa'];
                petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                petalsContainer.appendChild(petal);
                
                // Nettoyer après la fin de l'animation
                setTimeout(() => {
                    petal.remove();
                }, (duration + delay) * 1000);
            };

            // Générer un pétale toutes les 300ms
            const petalInterval = setInterval(() => {
                createPetal();
            }, 300);
        });

        // Gestion du clic sur les liens de navigation (vers Page 3)
        const overlayLinks = document.querySelectorAll('.overlay-nav-link');
        overlayLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);

                // Masquer Page 2, Afficher Page 3
                if (mainContent && page3) {
                    mainContent.classList.add('hidden');
                    mainContent.classList.remove('flex');
                    page3.classList.remove('hidden');
                    page3.classList.add('flex');
                    
                    // Pousser l'état dans l'historique
                    history.pushState({ page: 3 }, '', targetId);
                }

                if (targetEl) {
                    // Petit délai pour laisser le DOM s'actualiser avant de scroller
                    setTimeout(() => {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            });
        });

        // Gérer le bouton "Retour" du téléphone (API History)
        window.addEventListener('popstate', (e) => {
            const state = e.state;
            
            // Si on revient à l'état initial (la page d'accueil avec l'enveloppe)
            if (!state || !state.page) {
                if (headerEl) headerEl.style.display = 'flex';
                mainContent.classList.add('hidden');
                mainContent.classList.remove('flex');
                page3.classList.add('hidden');
                page3.classList.remove('flex');
            } 
            // Si on revient à la Page 2
            else if (state.page === 2) {
                if (headerEl) headerEl.style.display = 'none';
                mainContent.classList.remove('hidden');
                mainContent.classList.add('flex');
                page3.classList.add('hidden');
                page3.classList.remove('flex');
            }
            // Si on revient à la Page 3
            else if (state.page === 3) {
                if (headerEl) headerEl.style.display = 'none';
                mainContent.classList.add('hidden');
                mainContent.classList.remove('flex');
                page3.classList.remove('hidden');
                page3.classList.add('flex');
            }
        });
    }

    // --- Animation en cascade au défilement (Section Programme) ---
    const cascadeItems = document.querySelectorAll('.cascade-item');
    if ('IntersectionObserver' in window) {
        const cascadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || '0', 10);
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    cascadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cascadeItems.forEach(item => cascadeObserver.observe(item));
    } else {
        cascadeItems.forEach(item => item.classList.add('visible'));
    }
});
