function processFiles() {
    const fileInput = document.getElementById('txtFiles');
    const outputContainer = document.getElementById('outputContainer');
    const contactNameBase = document.getElementById('contactName').value.trim();
    const searchLabel = document.getElementById('searchLabel').value.trim();
    const vcfName = document.getElementById('vcfName').value.trim();

    outputContainer.innerHTML = ''; // Kosongkan hasil sebelumnya

    if (fileInput.files.length === 0) {
        alert('Tidak ada file yang dipilih.');
        return;
    }

    if (!contactNameBase) {
        alert('Harap masukkan nama kontak.');
        return;
    }

    Array.from(fileInput.files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const text = event.target.result;
            const lines = text.split(/\r?\n/); // Pisahkan file per baris
            let vcfContent = '';
            let startCollecting = searchLabel === ""; // Jika tidak ada label pencarian, mulai kumpulkan nomor

            lines.forEach((line) => {
                const trimmedLine = line.trim();
                
                // Mulai mengumpulkan jika menemukan label
                if (trimmedLine.includes(searchLabel) && searchLabel !== "") {
                    startCollecting = true;
                    console.log("Label found, starting collection");
                }

                if (startCollecting && trimmedLine !== '' && !isNaN(trimmedLine)) {
                    const contactName = `${contactNameBase} ${index + 1}-${vcfContent.length + 1}`;
                    vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${trimmedLine}\nEND:VCARD\n\n`;
                }
            });

            const fileNameToUse = vcfName || file.name.replace('.txt', '.vcf');
            console.log(`Processing file: ${file.name}, VCF name: ${fileNameToUse}`);

            // Buat div output untuk file yang diproses
            const fileOutput = document.createElement('div');
            fileOutput.classList.add('file-output');
            fileOutput.innerHTML = `
                <h3>Nama File Asal: ${file.name}</h3>
                <textarea rows="10">${text}</textarea>
                <button class="download" onclick="downloadVCF('${fileNameToUse}', \`${vcfContent}\`)">Generate VCF</button>
            `;
            outputContainer.appendChild(fileOutput);
        };

        reader.readAsText(file);
    });
}

function downloadVCF(vcfFileName, vcfContent) {
    console.log(`Downloading VCF file: ${vcfFileName}`);
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = vcfFileName;
    link.click();
}