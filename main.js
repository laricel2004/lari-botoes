document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordField = document.getElementById('campo-senha');
    const copyButton = document.getElementById('copiar-senha');
    const refreshButton = document.getElementById('atualizar-senha');
    const lengthSlider = document.getElementById('tamanho-slider');
    const lengthValue = document.getElementById('length-value');
    const checkboxes = document.querySelectorAll('.checkbox-container input');
    const selectAllButton = document.getElementById('selecionar-tudo');
    const quickButtons = document.querySelectorAll('.quick-btn');
    const strengthBar = document.querySelector('.strength-bar');
    const entropyInfo = document.querySelector('.entropy-info');
    const notification = document.getElementById('notificacao');

    // Character sets
    const characterSets = {
        maiusculo: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        minusculo: 'abcdefghijklmnopqrstuvwxyz',
        numero: '0123456789',
        simbolo: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Initialize
    updatePassword();
    lengthSlider.addEventListener('input', updatePasswordLength);
    copyButton.addEventListener('click', copyPassword);
    refreshButton.addEventListener('click', updatePassword);
    selectAllButton.addEventListener('click', toggleSelectAll);
    
    // Add event listeners to checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePassword);
    });

    // Add event listeners to quick buttons
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const length = parseInt(this.dataset.tamanho);
            const uppercase = this.dataset.maiusculo === 'true';
            const lowercase = this.dataset.minusculo === 'true';
            const numbers = this.dataset.numero === 'true';
            const symbols = this.dataset.simbolo === 'true';

            // Update UI to match quick button settings
            lengthSlider.value = length;
            lengthValue.textContent = length;
            
            checkboxes[0].checked = uppercase;
            checkboxes[1].checked = lowercase;
            checkboxes[2].checked = numbers;
            checkboxes[3].checked = symbols;

            updatePassword();
        });
    });

    // Functions
    function updatePasswordLength() {
        lengthValue.textContent = lengthSlider.value;
        updatePassword();
    }

    function updatePassword() {
        const length = parseInt(lengthSlider.value);
        const selectedSets = getSelectedCharacterSets();
        
        if (selectedSets.length === 0) {
            passwordField.value = 'Selecione pelo menos um tipo';
            strengthBar.className = 'strength-bar';
            entropyInfo.textContent = '';
            return;
        }

        const allChars = selectedSets.join('');
        let password = '';
        
        // Ensure at least one character from each selected set
        selectedSets.forEach(set => {
            const randomIndex = Math.floor(Math.random() * set.length);
            password += set[randomIndex];
        });

        // Fill the rest of the password with random characters
        for (let i = password.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars[randomIndex];
        }

        // Shuffle the password to mix the guaranteed characters
        password = shuffleString(password);
        
        passwordField.value = password;
        calculatePasswordStrength(password, allChars);
    }

    function getSelectedCharacterSets() {
        const selected = [];
        checkboxes.forEach((checkbox, index) => {
            const key = Object.keys(characterSets)[index];
            if (checkbox.checked) {
                selected.push(characterSets[key]);
            }
        });
        return selected;
    }

    function shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    function calculatePasswordStrength(password, characterSet) {
        const length = password.length;
        const uniqueChars = new Set(characterSet).size;
        const entropy = Math.log2(Math.pow(uniqueChars, length));
        
        // Update strength bar
        strengthBar.className = 'strength-bar';
        
        if (entropy < 28) {
            strengthBar.classList.add('strength-weak');
        } else if (entropy < 36) {
            strengthBar.classList.add('strength-medium');
        } else if (entropy < 60) {
            strengthBar.classList.add('strength-strong');
        } else {
            strengthBar.classList.add('strength-very-strong');
        }
        
        // Update entropy information
        const timeToCrack = calculateTimeToCrack(entropy);
        entropyInfo.textContent = `Esta senha levaria ${timeToCrack} para ser quebrada.`;
    }

    function calculateTimeToCrack(entropy) {
        const guessesPerSecond = 1e9; // 1 billion guesses per second
        const seconds = Math.pow(2, entropy) / guessesPerSecond;
        
        if (seconds < 60) {
            return 'menos de um minuto';
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} minutos`;
        } else if (seconds < 86400) {
            return `${Math.floor(seconds / 3600)} horas`;
        } else if (seconds < 31536000) {
            return `${Math.floor(seconds / 86400)} dias`;
        } else {
            return `${Math.floor(seconds / 31536000)} anos`;
        }
    }

    function copyPassword() {
        if (!passwordField.value || passwordField.value === 'Selecione pelo menos um tipo') {
            return;
        }
        
        passwordField.select();
        document.execCommand('copy');
        
        // Show notification
        notification.textContent = 'Senha copiada para a área de transferência!';
        notification.classList.add('visible');
        
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 3000);
    }

    function toggleSelectAll() {
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        
        updatePassword();
    }
});