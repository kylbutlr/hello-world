$(function() {
    $(".container").hide()
    $(".container-glass").hide()
    $(".form-div").hide()
    $(".list-div").hide()
    $(".header").click(function(e) {
        $(".container").slideToggle(1000)
        $(".container-glass").slideToggle(1000)
        $(".form-div").slideToggle(1000)
        $(".list-div").slideToggle(1000)
        $("#input").focus()
    });
    $("#date").change(function() {
        const date = getDate(this.value);
        const now = getDate(new Date)
        if (date < now) {
            alert("ToDo entry must have a future date.");
            this.valueAsDate = now;
            this.focus();
        }
    });
    
    let data = [];
    let key;
    const $input = document.querySelector("#input");
    const $list = document.querySelector("#list");
    const $date = document.querySelector("#date");
    const $time = document.querySelector("#time");
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formSubmit = (e) => {
        e.preventDefault();
        if ($input.value === " ") {
            alert("ToDo entry must have a name.");
            $input.value = "";
            $input.focus();
        }
        else {
            let todo = {};
            const time = $time.value;
            if (time.length>0) {
                todo = {"key": key, "text": $input.value, "time": formatAMPM($time.value), "realtime": $time.value, "date": $date.value, "done": false};
            }
            else {
                todo = {"key": key, "text": $input.value, "realtime": $time.value, "date": $date.value, "done": false};
            }
            data.push(todo);
            renderTodo(todo, key);
            save();
            key++;
            $input.value = "";
            $time.value = "12:00";
            $date.valueAsDate = getDate(new Date);
        }
    }

    const clrClick = (e) => {
        e.preventDefault();
        if ($list.childElementCount>0) {
            for (i=0; i<$list.childElementCount; i++) {
                $list.childNodes[i].classList.add("post-delete");
            }
            setTimeout(function() {
                $list.innerHTML = "";
            }, 250);
        }
        else {
            $list.innerHTML = "";
        }
        data = [];
        key = 0;
        save();
    }

    const clrLS = (e) => {
        e.preventDefault();
        $list.innerHTML = "";
        data = [];
        key = 0;
        window.localStorage.clear();
        window.location.reload();
    }

    function formatAMPM(time) {
        let [h,m] = time.split(":");
        let ampm;
        if (0 < h && h < 10) {
            ampm = "am";
            h = h.substr(1);
        }
        else if (h == 12) {
            ampm = "pm";
            h = 12;
        }
        else if (12 < h && h < 24) {
            ampm = "pm";
            h -= 12;
        }   
        else {
            ampm = "am";
            h = 12;
        }
        return (h + ":" + m + " " + ampm);
    }

    function getDate(date) {
        const dateValue = new Date(date);
        const nowDate = new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000);
        return nowDate;
    }

    function formatDate(date) {
        const dateValue = new Date(date);
        const nowDate = new Date(dateValue.getTime() + dateValue.getTimezoneOffset() * 60000);
        return days[nowDate.getDay()] + ", " + months[nowDate.getMonth()] + " " + nowDate.getDate();
    }

    function renderTodo(todo, key) {
        const newList = document.createElement("li");
        const formattedDate =  formatDate(new Date(todo.date));
        if (!todo.time) {
            newList.textContent = todo.text + " (by " + formattedDate + ")";
        }
        else {
            newList.textContent = todo.text + " (by " + todo.time + " on " + formattedDate + ")";
        }
        newList.key = key;
        newList.appendChild(edtBtn(key));
        newList.appendChild(dltBtn(key));
        newList.insertBefore(checkbox(todo, key), newList.childNodes[0]);
        if (todo.done === true) {
            newList.classList.add("checked");
        }
        newList.classList.add("new-post");
        $list.appendChild(newList);
        setTimeout(function() {
            newList.classList.add("post-visible");
        });
    }

    function edtBtn(key) {
        const editB = document.createElement("button");
        editB.dataset.key = key;
        editB.className = "edit-button button";
        editB.textContent = "Edit";
        editB.addEventListener("click", editPost);
        return editB;
    }

    function editPost(e) {
        e.preventDefault();
        const t = data.findIndex(x => x.key == e.target.dataset.key);
        $input.value = data[t].text;
        $time.value = data[t].realtime;
        $date.value = data[t].date;
        data.splice(t, 1);
        e.target.parentNode.classList.add("post-delete");
        $input.select();
        setTimeout(function() {
            e.target.parentNode.remove();
        }, 250);
    }

    function checkbox(todo, key) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "check-box";
        checkbox.dataset.key = key;
        checkbox.addEventListener("click", checkPost)
        if (todo.done === true) {
            checkbox.checked = true;
        }
        else { 
            checkbox.checked = false;
        }
        return checkbox;
    }

    function checkPost(e) {
        const target = data.findIndex(x => x.key == e.target.dataset.key);
        if (e.target.parentNode.classList.contains("checked")) {
            e.target.parentNode.classList.remove("checked");
            e.target.checked = false;
            data[target].done = false;
            save();
        }
        else {
            e.target.parentNode.classList.add("checked");
            e.target.checked = true;
            data[target].done = true;
            save();
        }
    }

    function deletePost(e) {
        e.preventDefault();
        let target = data.findIndex(x => x.key == e.target.dataset.key);
        data.splice(target, 1);
        e.target.parentNode.classList.add("post-delete");
        setTimeout(function() {
            e.target.parentNode.remove();
        }, 250);
        save();
    }

    function dltBtn(key) {
        const dltBtn = document.createElement("button");
        dltBtn.dataset.key = key;
        dltBtn.className = "delete-button button";
        dltBtn.textContent = "Delete";
        dltBtn.addEventListener("click", deletePost);
        return dltBtn;
    }

    function save() {
        window.localStorage.setItem("tododata", JSON.stringify(data));
    }

    function getSaved() {
        data = JSON.parse(window.localStorage.getItem("tododata"));
        if (!data) {
            data = [];
            const dflt1 = {"key": 0, "text": "Delete this ToDo entry", "realtime": "", "date": $date.value, "done": true};
            const dflt2 = {"key": 1, "text": "Add more to my ToDo list", "realtime": "", "date": $date.value, "done": false};
            data.push(dflt1, dflt2);
            renderTodo(dflt1, 0);
            renderTodo(dflt2, 1);
            key = 2;
            save();
        }
        else if (data.length>0) {
            for (let i=0; i<data.length; i++) {
                data[i].key = i;
                renderTodo(data[i], i);
            }
            key = data[data.length - 1].key + 1;
        }
        else {
            $list.innerHTML = "";
            data = [];
            key = 0;
        }
    }

    $time.value = "12:00";
    $date.valueAsDate = getDate(new Date);
    form.addEventListener("submit", formSubmit, false);
    clrBtn.addEventListener("click", clrClick, false);
    clsBtn.addEventListener("click", clrLS, false);
    getSaved();
});