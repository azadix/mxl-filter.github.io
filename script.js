$(document).ready(function () {
    // Initial JSON structure
    let jsonData = [];

    let table = new DataTable('#rulesTable', {
        autoWidth: true,
        paging: false,
        order: [],
        fixedHeader: true,
        targets: 'no-sort',
        scrollY: 550,
        scrollCollapse: false,
        columnDefs: [
            {
                visible: false,
                targets: 0
            }
        ],
        layout: {
            topStart: function () {
                return createAddRuleButton();
            },
            topEnd: '', //search
            bottomStart: {
                info: {
                    empty: '',
                    text: 'Rule count: _TOTAL_',
                }
            }
        }
    });

    const defaultRule = {
        id: Date.now(),
        active: true,
        show_item: true,
        item_quality: -1,
        ethereal: 0,
        min_clvl: 0,
        max_clvl: 0,
        min_ilvl: 0,
        max_ilvl: 0,
        rule_type: -1,
        params: null,
        notify: true,
        automap: true
    };

    // Define the Add Rule functionality
    function createAddRuleButton() {
        const addRuleButton = document.createElement('button');
        addRuleButton.classList.add("button", "is-success", "is-outlined");
        addRuleButton.innerHTML = '<span class="icon is-small"><i class="fas fa-plus"></i></span><span>Add new rule</span>';

        // Add click event to append a new row
        addRuleButton.addEventListener("click", () => {
            const newRule = JSON.parse(JSON.stringify(defaultRule));
            newRule.id = Date.now();

            jsonData.unshift(newRule);
            renderTableFromJson();
        });

        return addRuleButton;
    }

    function createParamsDropdown(ruleType) {
        const outerWrapper = document.createElement('div');
        const selectParams = document.createElement('select');
        outerWrapper.classList.add("select");
        selectParams.classList.add("rule-param-type")

        Object.entries(ruleTypes).forEach(([key, value]) => {
            let option = document.createElement("option");
            option.value = value;
            option.text = key;
            selectParams.appendChild(option);
        });

        selectParams.value = ruleType;
        outerWrapper.appendChild(selectParams);
        return outerWrapper;
    }

    function createOptionParams(ruleType, jsonIndex ) {
        let groupWrapper = document.createElement('div');
        let datalistWrapper = document.createElement('div');
        let datalist = document.createElement('select');
    
        datalistWrapper.classList.add("select", "width-100");
        datalist.classList.add("rule-param-value", "min-width-100");
    
        groupWrapper.appendChild(createParamsDropdown(ruleType));
        groupWrapper.appendChild(datalistWrapper);
        groupWrapper.classList.add("input-wrapper");
    
        // Populate the datalist based on the rule type
        switch (Number(ruleType)) {
            case 1: // Items
                Object.entries(itemCodes).forEach(([key, value]) => {
                    let option = document.createElement("option");
                    option.value = value;
                    option.text = key;
                    datalist.appendChild(option);
                });
    
                // Set the value of the datalist based on jsonData
                if (jsonData[jsonIndex]?.params?.code !== undefined) {
                    datalist.value = jsonData[jsonIndex].params.code;
                }
                datalistWrapper.appendChild(datalist);
                return groupWrapper;
    
            case 0: // Class
                Object.entries(itemTypes).forEach(([key, value]) => {
                    let option = document.createElement("option");
                    option.value = value;
                    option.text = key;
                    datalist.appendChild(option);
                });
    
                // Set the value of the datalist based on jsonData
                if (jsonData[jsonIndex]?.params?.class !== undefined) {
                    datalist.value = jsonData[jsonIndex].params.class;
                }
                datalistWrapper.appendChild(datalist);
                return groupWrapper;
    
            default:
                datalistWrapper.classList.remove("width-100");
                return groupWrapper;
        }
    }

    $('#pasteFromClipboard').on('click', function () {
        try {
            let text;
            // Fallback for browsers without clipboard API support
            text = prompt("Please paste the JSON data here:");
            if (!text) {
                showToast("No data pasted.");
                return;
            }
    
            const data = JSON.parse(text);
    
            // Validate and update jsonData
            if (data && typeof data === "object" && data.rules) {
                jsonData = data.rules;
    
                // Update checkbox state using .prop()
                $('#defaultShowItems').prop('checked', data.default_show_items);
    
                // Update filter name input
                $('#filterName').val(data.name);
    
                // Re-render the table
                renderTableFromJson();
            } else {
                showToast("Invalid JSON format.");
            }
        } catch (error) {
            showToast("Failed to paste: " + error);
        }
    });
    $('#copyToClipboard').on('click', function () {
        console.log(jsonData)
        navigator.clipboard.writeText(generateOutput())
            .then(() => showToast("Filter copied to clipboard!", true))
            .catch(err => showToast("Failed to copy: " + err));
    });
    
    table.on('change', '.rule-is-active', function () {
        const paramValue = $(this).is(":checked");
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].active = paramValue;
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-is-shown', function () {
        const paramValue = $(this).val();
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].show_item = !Boolean(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-quality', function () {
        const paramValue = $(this).val();
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].item_quality = Number(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-is-eth', function () {
        const paramValue = $(this).val();
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].ethereal = Number(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-param-type', function () {
        const paramValue = $(this).val();
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].rule_type = Number(paramValue);

            switch (paramValue) {
                case "-1":
                    jsonData[dataIndex].params = null;
                    break;
                case "0":
                    jsonData[dataIndex].params = {class: 0}
                    break;
                case "1":
                    jsonData[dataIndex].params = {code: 0}
                    break;
            }
        } else {
            console.warn('Row does not have a valid data-index');
        }
        renderTableFromJson();
    });
    table.on('change', '.rule-param-value', function () {
        const paramValue = $(this).val();
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            if (Number(paramValue) <= findLargestValue(itemTypes)) {
                jsonData[dataIndex].params.class = Number(paramValue)
            } else {
                jsonData[dataIndex].params.code = Number(paramValue)
            }
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-min-clvl', function () {
        const paramValue = $(this).val();
        $(this).val(clampLvlValues(paramValue))
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].min_clvl = clampLvlValues(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-max-clvl', function () {
        const paramValue = $(this).val();
        $(this).val(clampLvlValues(paramValue))
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].max_clvl = clampLvlValues(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-min-ilvl', function () {
        const paramValue = $(this).val();
        $(this).val(clampLvlValues(paramValue))
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].min_ilvl = clampLvlValues(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-max-ilvl', function () {
        const paramValue = $(this).val();
        $(this).val(clampLvlValues(paramValue))
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].max_ilvl = clampLvlValues(paramValue);
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-is-notify', function () {
        const paramValue = $(this).is(":checked");
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].notify = paramValue;
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });
    table.on('change', '.rule-is-automap', function () {
        const paramValue = $(this).is(":checked");
        const dataIndex =  $(this).closest('tr').data('index');
        
        if (dataIndex !== undefined) {
            jsonData[dataIndex].automap = paramValue;
        } else {
            console.warn('Row does not have a valid data-index');
        }
    });

    table.on('draw', function () {
        table.rows().every(function (rowIdx) {
            const rowNode = this.node(); // Get the DOM node of the row
            rowNode.dataset.index = rowIdx; // Set dataset.index to the row index
        });
    });
    
    // Event delegation for delete buttons
    table.on('click', '.delete-rule', function () {
        // Get the row that contains the delete button
        const row = $(this).closest('tr');
        
        // Retrieve the row's dataset index
        const index = row.data('index'); // Use jQuery's .data() to get the correct index
        
        // Check if the index is valid
        if (index !== undefined && index >= 0 && index < jsonData.length) {
            // Remove the corresponding item from jsonData
            jsonData.splice(index, 1);
    
            // Re-render the table with updated jsonData
            renderTableFromJson();
        } else {
            console.warn("Invalid index or index out of bounds.");
        }
    });
    

    function addSortables() {
        const rulesTable = document.getElementById("rulesTable");
        const tbody = rulesTable ? rulesTable.querySelector('tbody') : null;
    
        if (tbody) {
            new Sortable(tbody, {
                handle: '.handle', // Drag handle
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function () {
                    // Create a new sorted list based on the current DOM order
                    const newOrder = Array.from(tbody.children).map(ruleItem => {
                        const updatedIndex = ruleItem.dataset.index; // Get the dataset.index
                        return jsonData[updatedIndex]; // Map to jsonData using the updated index
                    });
    
                    // Update jsonData to match the new order
                    jsonData = newOrder;
    
                    // Optionally, refresh the table if needed
                    renderTableFromJson()
                }
            });
        } else {
            console.warn("No tbody found");
        }
    }
    function renderTableFromJson() {
        table.clear();
        jsonData.forEach((item, index) => {
            table.row.add([
                item.id | Date.now(),
                `<span class="handle icon is-normal"><i class="fas fa-arrows-alt-v"></i></span>`,
                `<div class="checkbox-container"><input id="active" class="checkbox-input rule-is-active" type="checkbox" ${item.active ? 'checked' : ''}></div>`,
                `<div class="select">
                    <select class="rule-is-shown">
                        <option value="1" ${item.show_item == "1" ? 'selected' : ''}>Show</option>
                        <option value="0" ${item.show_item == "0" ? 'selected' : ''}>Hide</option>
                    </select>
                </div>`,
                `<div class="select">
                    <select class="rule-is-eth">
                        ${Object.entries(etherealState).map(([key, value]) => `
                            <option value="${value}" ${item.ethereal === value ? 'selected' : ''}>${key}</option>
                        `).join("")}
                    </select>
                </div>`,
                `<div class="select">
                    <select class="rule-quality">
                        ${Object.entries(itemQuality).map(([key, value]) => `
                            <option value="${value}" ${item.item_quality === value ? 'selected' : ''}>${key}</option>
                        `).join("")}
                    </select>
                </div>`,
                createOptionParams(item.rule_type, index),
                `<div class="input-wrapper">
                    <div><input class="input form-group-input rule-min-clvl" placeholder="0" id="min_clvl" type="number" value="${item.min_clvl}"></div>
                    <div><input class="input form-group-input rule-max-clvl" placeholder="0" id="max_clvl" type="number" value="${item.max_clvl}"></div>
                </div>`,
                `<div class="input-wrapper">
                    <div><input class="input form-group-input rule-min-ilvl" placeholder="0" id="min_ilvl" type="number" value="${item.min_ilvl}"></div>
                    <div><input class="input form-group-input rule-max-ilvl" placeholder="0" id="max_ilvl" type="number" value="${item.max_ilvl}"></div>
                </div>`,
                `<div class="checkbox-container"><input id="notify" class="checkbox-input rule-is-notify" type="checkbox" ${item.notify ? 'checked' : ''}></div>`,
                `<div class="checkbox-container"><input id="automap" class="checkbox-input rule-is-automap" type="checkbox" ${item.automap ? 'checked' : ''}></div>`,
                `<a class="button is-danger is-outlined delete-rule"><i class="fas fa-trash pr-1"></i></a>`
            ]);
        })

        table.draw();

        // Adjust columns for proper rendering
        table.columns.adjust();
    }

    function findLargestValue(jsonData) {
        let largestValue = -Infinity; // Initialize with a very small value
    
        // Iterate through the JSON data object and find the largest value
        Object.entries(jsonData).forEach(([key, value]) => {
            if (value > largestValue) {
                largestValue = value; // Update largest value
            }
        });
    
        // Return the largest value found
        return largestValue;
    }
    function clampLvlValues(value) {
        if (value !== "" && !isNaN(value)) {
            let numericValue = Number(value);
            return Math.min(Math.max(numericValue, 0), 150);
        } else {
            console.error("Invalid input: Value must be a non-empty number.");
            return 0;
        }
    }
    function generateOutput() {
        const filterName = $('#filterName').val().trim();
        let cleanedData = jsonData.map(rule => {
            const { id, ...ruleWithoutId } = rule;  // destructure to remove 'id'
            return ruleWithoutId;
        });

        return JSON.stringify({
            default_show_items: $('#defaultShowItems').is(":checked"),
            name: filterName == "" ? `UnnamedFilter${Date.now().toString()}` : filterName,
            rules: cleanedData
        }, null, 2);
    }
    function showToast(message, autoRemove = false) {
        // Create a container for the toast if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.classList.add('toast-container');
            document.body.appendChild(container);
        }
    
        // Create the toast message element
        const toast = document.createElement("div");
        toast.classList.add("toast-message");
        toast.innerText = message;
    
        // Add event listener for the close button to remove the toast when clicked
        $(toast).on('click', () => {
            fadeOutAndRemove(toast);
        });
    
        // If autoRemove is true, the toast will disappear automatically after 2.5 seconds
        if (autoRemove) {
            setTimeout(() => {
                fadeOutAndRemove(toast);
            }, 2500); // Show for 2.5 seconds
        } else {
            // Change background color or add a label to show that it requires manual removal
            toast.classList.add("manual-close-toast");
            toast.innerHTML += '<div class="manual-toast-label">Click to dismiss</div>';
        }
    
        // Append the toast to the container
        $('.toast-container').append(toast);
    }
    function fadeOutAndRemove(toast) {
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.remove();
        }, 500); // Match the duration of the fade-out animation
    }

    addSortables();
});