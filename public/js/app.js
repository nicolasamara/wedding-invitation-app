document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const welcomeBanner = document.getElementById('welcome-banner');
    const rsvpForm = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const formFeedback = document.getElementById('form-feedback');

    // 1. Fetch guest details if token is present
    if (token) {
        fetchGuestDetails(token);
    } else {
        console.warn("Aucun token trouvé dans l'URL.");
        // We could disable the RSVP form or show a generic message here
    }

    // 2. Handle RSVP Form Submission
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!token) {
                showFeedback("Lien d'invitation invalide (token manquant).", "error");
                return;
            }

            // Get form values
            const formData = new FormData(rsvpForm);
            const statut = formData.get('statut');
            const allergies = formData.get('allergies');

            // UI Loading state
            setLoading(true);
            
            try {
                const response = await fetch(`/api/invites/${token}/rsvp`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ statut, allergies }),
                });

                const data = await response.json();

                if (response.ok) {
                    showFeedback("Merci ! Votre réponse a été enregistrée avec succès.", "success");
                    // Optionally disable form after success
                    const inputs = rsvpForm.querySelectorAll('input, textarea, button');
                    inputs.forEach(input => input.disabled = true);
                } else {
                    showFeedback(data.error || "Une erreur est survenue.", "error");
                }
            } catch (error) {
                console.error("Erreur de soumission RSVP:", error);
                showFeedback("Erreur de connexion au serveur.", "error");
            } finally {
                setLoading(false);
            }
        });
    }

    // --- Helper Functions ---

    async function fetchGuestDetails(token) {
        try {
            const response = await fetch(`/api/invites/${token}`);
            if (response.ok) {
                const guest = await response.json();
                
                // Show Welcome Banner
                welcomeBanner.innerHTML = `Bienvenue au mariage, <span class="font-bold">${guest.prenom}</span> !`;
                welcomeBanner.classList.remove('hidden');
                // Trigger reflow to apply transition
                void welcomeBanner.offsetWidth;
                welcomeBanner.classList.remove('opacity-0');

                // Pre-fill form if they already answered
                if (guest.statut === 'Présent' || guest.statut === 'Absent') {
                    const radio = document.querySelector(`input[name="statut"][value="${guest.statut}"]`);
                    if (radio) radio.checked = true;
                    
                    if (guest.allergies) {
                        document.getElementById('allergies').value = guest.allergies;
                    }
                }
            } else {
                console.error("Invitation introuvable ou erreur serveur.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des détails:", error);
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            loadingSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            loadingSpinner.classList.add('hidden');
        }
    }

    function showFeedback(message, type) {
        formFeedback.textContent = message;
        formFeedback.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        
        if (type === 'success') {
            formFeedback.classList.add('bg-green-100', 'text-green-800');
        } else {
            formFeedback.classList.add('bg-red-100', 'text-red-800');
        }
    }
});
