var weather = {},

dropdown_hovered = false,
clockoverflow = true,
exitPage = false,
keyDodge = false,
done = false,

engine_index = 0,
s_index = -1,
progress = 0,

hovered = "",
engines = [],

showWeather,
darkmode,
sidebar,
queries,
last,
autocomplete,
display_queries,
old_display_queries;

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getWeather() {
    if(showWeather){
        chrome.storage.local.get("startpage_settings", function(e){
            let dkey = e.startpage_settings.darksky_key.replace(/\s/g, '');
            let lat = e.startpage_settings.darksky_loc.lat;
            let lon = e.startpage_settings.darksky_loc.lon;
            if(dkey != ""){
                $.ajax({
                    url: "https://api.darksky.net/forecast/" + dkey + "/" + lat + "," + lon + "?exclude=[minutely,hourly,alerts,flags]",
                    dataType: "jsonp",
                    success: function(data) {
                        weather.temp = ((data.currently.temperature.toFixed(2) - 32) * 5 / 9).toFixed(1);;
                        weather.icon = data.currently.icon.toUpperCase();
                        weather.descr = data.currently.summary;
            
                        weather.hum = data.currently.humidity;
                        weather.clcover = data.currently.cloudCover;
                        weather.uv = data.currently.uvIndex / 11;
                        data.currently.uvIndex / 11;
                    }
                });
            }
        })
    }
}

function startWeather(){
    if(showWeather){
        getWeather();
        updateWeatherDisplay();
    }
    var t = setTimeout(startWeather, 600000);
}

function updateWeatherDisplay(){
    if(!(weather.descr === undefined || weather.temp === undefined) && showWeather){
        $(".weather-description").html(weather.descr);
        $(".weather-degrees").html(weather.temp + " C");
        $(".weather-container").css("opacity", 1);
    } else {
        $(".weather-container").css("opacity", 0);
        $(".weather-description").html("asdf");
        $(".weather-degrees").html("asdf");
    }
}

function updateTimeDisplay(h, m){
    if(done){
        progress = (h * 3600 + m * 60) / (24 * 36);
        $(".time").css("transform", "translateX(" + progress + "%)")
        
        if($(".header").width() * (100- progress) / 100 > 75){
            $(".clock").css("transform", "translateX(" + progress + "%)");
            $(".clock").removeClass("shiftLeft");
        } else {
            $(".clock").css("transform", "translateX(100%)");
            $(".clock").addClass("shiftLeft");
        }

        if(h==0 && m== 0 ){
            done = false;
            $(".second").css("opacity", 0);
            setTimeout(function(){
                done = true;
                $(".second").css("opacity", 1);
            }, 2900);
            setTimeout(function(){
                $(".clock").removeClass("shiftLeft");
            }, 500);   //maybe tweak a bit
        }
    }
}

function startTime() {
    var today = new Date();
    var mt = today.getMonth(),
    d = today.getDate(),
    h = checkTime(today.getHours()),
    m = checkTime(today.getMinutes()),
    s = checkTime(today.getSeconds());

    if(s == 0) updateTimeDisplay(today.getHours(), today.getMinutes());

    if(done){
        $(".hour").html(h)
        $(".minute").html(":" + m)
        $(".second").html(":" + s)
        $(".date").html(d)
        $(".month").html(monthToStr(mt))

        $(".side-time").html(h + ":" + m)
        $(".side-date").html(d)
        $(".side-month").html(monthNames[mt])

        var t = setTimeout(startTime, 500);
    } else {
        $(".hour").html(checkTime(Math.floor((parseInt($('.time').css('transform').split(',')[4])) / $(".header").width() * (24))))
        $(".minute").html(
            ":" + checkTime(
                Math.floor(
                    (
                        (
                            parseInt($('.time').css('transform').split(',')[4]) / $(".header").width()
                        ) * (24) - 
                        
                        Math.floor(
                            (
                                parseInt($('.time').css('transform').split(',')[4]) / $(".header").width()
                            ) * (24)
                        )
                    ) * 60
                )
            )
        );
        $(".second").html(":" + s)
        $(".month").html(monthToStr(mt))
        $(".date").html(d)

        $(".side-time").html(h + ":" + m)
        $(".side-date").html(d)
        $(".side-month").html(monthNames[mt])
        
        if($(".header").width() - parseInt($('.time').css('transform').split(',')[4]) < 65 && clockoverflow){
            $(".clock").addClass("shiftLeft");
            clockoverflow = false;
        }

        var t = setTimeout(startTime, 10);
    }
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};
    return i;
}

function startDarkCheck(){
    chrome.runtime.sendMessage({action: "update_dark"}, function(response) {
		updateDarkMode();
    });
    var t = setTimeout(startDarkCheck, 30000)
}

function monthToStr(mt){
    switch(mt +1){
        case 1: return "JAN";
        case 2: return "FEB";
        case 3: return "MAR";
        case 4: return "APR";
        case 5: return "MAY";
        case 6: return "JUN";
        case 7: return "JUL";
        case 8: return "AUG";
        case 9: return "SEP";
        case 10: return "OCT";
        case 11: return "NOV";
        case 12: return "DEC";
    }
}

function searchExit(url){
    $("#white").addClass("search-exit-fade");
    setTimeout(function(){
        window.location = url;
    }, 70)
}

function clicked(str, sub){
    exitPage = true;
    $(str + "-b").addClass("preview-active-exit");
    $(str + "-b .small-bar").addClass("small-bar-active-exit");
    $(".content").addClass("fade-out");
    $(".header").addClass("fade-out");
    $(".slider").addClass("display");
    setTimeout(function(){
        $(".triangle-colored").addClass(str.slice(1, str.length) + "-triangle-colored-exit");
        $(".triangle-white").addClass("triangle-white-exit");
        setTimeout(function(){
            switch(str){
                case "#yt":
                    switch(sub){
                        case "subscriptions": url = "https://www.youtube.com/feed/subscriptions"; break;
                        case "ttt": url = "https://www.youtube.com/results?search_query=ttt+pietsmiet&sp=CAISBBABGAI%253D"; break;
                        case "hdsoundi": url = "https://www.youtube.com/user/MarK1Ira/videos"; break;
                        default: url = "https://www.youtube.com/"; break;
                    } 
                break;

                case "#sc":
                    switch(sub){
                        case "likes": url = "https://soundcloud.com/you/likes"; break;
                        case "history": url = "https://soundcloud.com/you/history"; break;
                        default: url = "https://soundcloud.com/discover/"; break;
                    } 
                break;

                case "#tv":
                    switch(sub){
                        case "2200": url = "https://www.tvspielfilm.de/tv-programm/sendungen/fernsehprogramm-nachts.html"; break;
                        case "tomorrow": 
                            now = new Date();
                            url = "https://www.tvspielfilm.de/tv-programm/sendungen/?page=1&order=time&date=" + now.getFullYear() + "-" + checkTime(now.getMonth() + 1) + "-" + checkTime(now.getDate() + 1) + "&cat%5B%5D=SP&cat%5B%5D=SE&cat%5B%5D=RE&cat%5B%5D=U&cat%5B%5D=KIN&cat%5B%5D=SPO&time=prime&channel=";
                        break;
                        case "friday":
                            now = new Date();
                            now.setDate(now.getDate() + (5+(7-now.getDay())) % 7);
                            url = "https://www.tvspielfilm.de/tv-programm/sendungen/?page=1&order=time&date=" + now.getFullYear() + "-" + checkTime(now.getMonth() + 1) + "-" + checkTime(now.getDate()) + "&cat%5B%5D=SP&cat%5B%5D=SE&cat%5B%5D=RE&cat%5B%5D=U&cat%5B%5D=KIN&cat%5B%5D=SPO&time=prime&channel=";
                        break;
                        default: url = "https://www.tvspielfilm.de/tv-programm/sendungen/abends.html"; break;
                    } 
                break;

                case "#tw":
                    switch(sub){
                        case "nightblue3": url = "https://www.twitch.tv/nightblue3"; break;
                        case "nasa": url = "https://www.twitch.tv/nasa"; break;
                        case "shroud": url = "https://www.twitch.tv/shroud"; break;
                        default: url = "https://www.twitch.tv/directory"; break;
                    } 
                break;

                case "#g":
                    switch(sub){
                        case "subscriptions": url = "https://www.reddit.com/user/Valkyrie_Cain_"; break;
                        case "ttt": url = "https://www.reddit.com/r/all"; break;
                        default: url = "https://www.reddit.com/"; break;
                    } 
                break;
            }
            window.location = url;
        }, 600)
    }, 350)
}

function hoverIn(str){
    hovered = str
    $(str + "-b").addClass("preview-active");
    $(str + "-b .small-bar").addClass("small-bar-active");
    $(str + " .container-color-cover .cover").addClass("cover-active");
    $(str + " .container-color-cover").addClass("container-color-cover-active");
    if(darkmode){
        $(str + " .image-container img").css("opacity", "0.9");
    } else {
        $(str + " .image-container img").addClass("preview-small-img-active");
    }
    $(str + " .container-color .outer-rect").addClass("outer-rect-active");
    $(str + " .container-white .inner-rect").addClass("inner-rect-active");
    $(str + "-text .text-site").addClass("text-site-active");
    $(str + "-text .text-underline").addClass("text-underline-active");
    $(str + "-text .text-site").addClass("text-site-active");
    $(str + "-text .text-underline").addClass("text-underline-active");
    $(str + "-text .text-site").addClass("text-opacity-active");
    $(str + "-text .text-underline").addClass("text-opacity-active");
}

function hoverOut(str){
    if(!dropdown_hovered){
        hovered = ""
    }
    $(str + "-b").removeClass("preview-active");
    $(str + "-b .small-bar").removeClass("small-bar-active");
    $(str + " .container-color-cover .cover").removeClass("cover-active");
    $(str + " .container-color-cover").removeClass("container-color-cover-active");
    if(darkmode){
        $(str + " .image-container img").css("opacity", "0");
    } else {
        $(str + " .image-container img").removeClass("preview-small-img-active");
    }
    $(str + " .container-color .outer-rect").removeClass("outer-rect-active");
    $(str + " .container-white .inner-rect").removeClass("inner-rect-active");
    $(str + "-text .text-site").removeClass("text-site-active");
    $(str + "-text .text-underline").removeClass("text-underline-active");
    $(str + "-text .text-site").removeClass("text-opacity-active");
    $(str + "-text .text-underline").removeClass("text-opacity-active");

}

function startFocusOut(preview){
    $(document).on("click",function(){
        $("#" + preview + " .dropdown").hide();        
        $(document).off("click");
    });
} 

function manageHovered(){
    h = hovered;
    hovered = "";
    $(h + " .dropdown").hide();
    setTimeout(function(){
        if(hovered != h){
            hoverOut(h);
        }
        dropdown_hovered = false;
    }, 5)
}

function enginePrefix(query){
    if(engines[engine_index].url.replace(/\s/g, '') != ""){
        return engines[engine_index].url + query
    } else {
        return "www.google.com/search?q=" + query
    }
}

function searchSelect(selected_index){
    if(selected_index >= 0){
        $.each($(".suggestions ul li"), function(index, element) {
            if(index == selected_index){
                $(".suggestions ul li").eq(index).addClass("highlighted")
            } else {
                $(".suggestions ul li").eq(index).removeClass("highlighted")
            }
        });
    } else {
        $.each($(".suggestions ul li"), function(index, element) {
            $(".suggestions ul li").eq(index).removeClass("highlighted")
        });
    }
}

function updateDarkMode(){
    chrome.storage.local.get('startpage_settings', function(e){
        darkmode = e.startpage_settings.darkmode;
        $(".dark-mode input").prop("checked", e.startpage_settings.darkmode);
        
        if(darkmode){
            $("body").addClass("dark-light");
            $("#input").addClass("dark-light");
            $(".clock span").addClass("white-font");
            $(".text-underline").addClass("white-background");
            $(".white").addClass("dark-light");
            $(".triangle-white").css("border-bottom-color", "rgb(45, 45, 45)");
        } else {
            $("body").removeClass("dark-light");
            $("#input").removeClass("dark-light");
            $(".clock span").removeClass("white-font");
            $(".text-underline").removeClass("white-background");
            $(".white").removeClass("dark-light");
            $(".triangle-white").css("border-bottom-color", "white");
        }
    });
}

function loadSidebar(i){
    chrome.storage.local.get("startpage_settings", function(e){
        if(i < e.startpage_settings.sidebar_websites.length){
            let website = e.startpage_settings.sidebar_websites[i];
            if(website.img.indexOf("file:///") == 0 || website.img.indexOf("http://") == 0 || website.img.indexOf("https://") == 0){
                src = website.img;
            } else {
                src = "/startpage/img/sidebar/" + website.img
            }
                    
            if(src.replace(/\s/g, '') != "" && src.split(".").length > 1){
                $.get(src)
                .done(function() { 
                    var li = document.createElement("li")
        
                        var img = document.createElement("img");
                        img.src = src;
                        
                        li.append(img)
        
                        var p = document.createElement("p")
                        p.innerText = website.name
                        li.append(p);
            
                    $(".more-websites-list").append(li);
        
                    loadSidebar(i+1)
                }).fail(function() { 
                    var li = document.createElement("li")
    
                        var big = document.createElement("span")
                        big.innerText = website.name[0].toUpperCase();
    
                        li.append(big)
        
                        var p = document.createElement("p")
                        p.innerText = website.name
                        li.append(p);
            
                    $(".more-websites-list").append(li);
        
                    loadSidebar(i+1)
                })
            } else {
                var li = document.createElement("li")
    
                var big = document.createElement("span")
                big.innerText = website.name[0].toUpperCase();

                li.append(big)

                var p = document.createElement("p")
                p.innerText = website.name
                li.append(p);
    
                $(".more-websites-list").append(li);

                loadSidebar(i+1)
            }
        } else {
            $.each($(".more-websites-list li"), function(index, element){
                $(".more-websites-list li").eq(index).on("click", function(){
                    name = $(this).find("p").text()
                    chrome.storage.local.get("startpage_settings", function(e){
                        if(e.startpage_settings.sidebar_websites.filter(website => website.name == name)[0].url.replace(/\s/g, '') != ""){
                            chrome.runtime.sendMessage({
                                navigate: e.startpage_settings.sidebar_websites.filter(website => website.name == name)[0].url,
                                newTab: "false"
                            });
                        }
                    });
                })
            })
        }
    })
}

chrome.storage.local.get('startpage_settings', function(e){
    engines = e.startpage_settings.search_engines;
});
$(function() {

    chrome.storage.local.get('startpage_settings', function(e){
        showWeather = e.startpage_settings.weather;
        if(!e.startpage_settings.sidebar){
            $(".sidebar").hide();
        } else {
            loadSidebar(0);
        }
    
        getWeather();
    });

    
    $("#input").addClass("notrans");
    setTimeout(function(){
        $("#input").removeClass("notrans");
    }, 100);

    startTime();

    startDarkCheck();

    setTimeout(function(){
		$("body").addClass("smooth-bg")
	}, 1000)

    // ---------------------------------------------------- SEARCH BAR -------------------------------------------------------------------

    $("#input").val("")

    $("input").attr("placeholder", "Search " + engines[0].name)
    $("#input").css("border-color", engines[0].color)

    $("#input").keydown(function(e) {
        let val = $(this).val();
        switch(e.keyCode){
            case 9: // TAB
                keyDodge = true;

                if(e.shiftKey){
                    if($("#input").val() != ""){
                        let s_length = $(".suggestions ul li").length;
                        s_index++;
                        if(s_index >= s_length) s_index = 0;
                        if(s_length > 0){
                            if($(".suggestions ul li").eq(s_index).position().top != 0) s_index = 0;
                            setTimeout(function(){
                                searchSelect(s_index);
                            }, 10)
                        }
                    }
                } else {
                    chrome.storage.local.get("startpage_settings", function(s){
                        engines = s.startpage_settings.search_engines;
                        last_index = engine_index;
                        s_index = -1;
        
                        engine_index++;
                        if(engine_index >= engines.length) engine_index = 0;
        
                        $("#input").attr("placeholder", "Search " + engines[engine_index].name)
                        $("#input").css("border-color", engines[engine_index].color)
                    })
                }
                break;
                
            case 13: // ENTER
                keyDodge = true;
                chrome.storage.local.get("startpage_autocomplete", function(e){
                    queries = e.startpage_autocomplete.suggestions;
                    last = e.startpage_autocomplete.last;
                    autocomplete = e.startpage_autocomplete.enabled;
                    
                    chrome.storage.local.get("startpage_settings", function(s){
                        engines = s.startpage_settings.search_engines;

                        if(!e.shiftKey && autocomplete){
                            if($(".highlighted").length == 0){
                                try{
                                    queries.filter(query => {
                                        return (query.query.toUpperCase() == val.toUpperCase() && query.engine ==  engines[engine_index].name);
                                    })[0].p++;
                                    queries.filter(query => {
                                        return (query.query.toUpperCase() == val.toUpperCase() && query.engine == engines[engine_index].name);
                                    })[0].time = new Date().getTime();
                                } catch(e){
                                    
                                    queries.push(
                                        {
                                            engine: engines[engine_index].name,
                                            query: val,
                                            p: 1,
                                            time: new Date().getTime()
                                        }
                                    )
                                }
                                queries.sort(function (a, b) {
                                    return b.p - a.p;
                                });
    
                                    chrome.storage.local.set({startpage_autocomplete:{
                                        enabled: autocomplete,
                                        suggestions: queries,
                                        last: val
                                    }})
                                    
                                    searchExit(enginePrefix(val));
    
    
                            } else {
                                
                                try{
                                    queries.filter(query => {
                                        return (query.query.toUpperCase() == $(".highlighted").eq(0).html().toUpperCase() && query.engine == engines[engine_index].name);
                                    })[0].p++;
                                    queries.filter(query => {
                                        return (query.query.toUpperCase() == $(".highlighted").eq(0).html().toUpperCase() && query.engine == engines[engine_index].name);
                                    })[0].time = new Date().getTime();
                                } catch(e){
                                    queries.push(
                                        {
                                            engine: engines[engine_index].name,
                                            query: $(".highlighted").eq(0).html(),
                                            p: 1,
                                            time: new Date().getTime()
                                        }
                                    )
                                }
                                
                                queries.sort(function (a, b) {
                                    return b.p - a.p;
                                });
    
                                    chrome.storage.local.set({startpage_autocomplete:{
                                        enabled: autocomplete,
                                        suggestions: queries,
                                        last: $(".highlighted").eq(0).html()
                                    }})
                                    
                                    searchExit(enginePrefix($(".highlighted").eq(0).html()));
                                
                            }
                        } else {
                            if($(".highlighted").length == 0){
                                searchExit(enginePrefix(val));
                            } else {
                                searchExit(enginePrefix($(".highlighted").eq(0).html()));
                            }
                        }
                    });
                });
                break;

            case 27: // ESC
                searchSelect(-1);
            break;

            default:
                if($(".highlighted").length != 0){
                    old = $(".highlighted").eq(0).html();
                    setTimeout(function(){
                        $.each($(".suggestions ul li"), function(index, element) {
                            if($(".suggestions ul li").eq(index).html() == old){
                                $(".suggestions ul li").eq(index).addClass("highlighted")
                            } else {
                                $(".suggestions ul li").eq(index).removeClass("highlighted")
                            }
                        });
                    }, 10);
                }
                
            break;
        }

        chrome.storage.local.get("startpage_autocomplete", function(e){
            queries = e.startpage_autocomplete.suggestions;
            last = e.startpage_autocomplete.last;
            autocomplete = e.startpage_autocomplete.enabled;
            
            chrome.storage.local.get("startpage_settings", function(s){
                engines = s.startpage_settings.search_engines;
                setTimeout(function(){
                    if($("#input").val() != "" && autocomplete){
    
                        if(display_queries){
                            old_display_queries = display_queries;
                        }
    
                        display_queries = queries.filter(query => {
                            return (query.engine == engines[engine_index].name && query.query.toUpperCase().includes($("#input").val().toUpperCase()));
                        })
    
                        //fist letter sort
                        if($("#input").val().length == 1){
                            display_queries.sort(function (a, b) {
                                if(a.query.toUpperCase()[0] == $("#input").val().toUpperCase()[0] && b.query.toUpperCase()[0] != $("#input").val().toUpperCase()[0]){
                                    return -1
                                } else if (b.query.toUpperCase()[0] == $("#input").val().toUpperCase()[0] && a.query.toUpperCase()[0] != $("#input").val().toUpperCase()[0]){
                                    return 1;
                                }
                                return 0;
                            });
                        }
    
                        //last search bias
                        if(last != undefined && last != ""){
                            if(display_queries.filter(display_query => {
                                return display_query.query.toUpperCase() == last.toUpperCase();
                            }).length != 0 && ($("#input").val().length != 1 || $("#input").val().toUpperCase()[0] == last.toUpperCase()[0])){
                                display_queries.sort(function (a, b) {
                                    if(a.query.toUpperCase() == last.toUpperCase()){
                                        return -1
                                    } else if (a.query.toUpperCase() != last.toUpperCase()){
                                        return 1;
                                    }
                                    return 0;
                                });
                            }
                        }
    
                        // dont update when...
                        if(![16, 13].includes(e.keyCode)){
                        $(".suggestions ul").html("");
                            display_queries.forEach(display_query => {
                                $(".suggestions ul").append($('<li>' + display_query.query + '</li>'))
                            });
                            $(".suggestions").css("display", "block")
                        }
                    } else {
                        $(".suggestions").css("display", "none")
                    }
    
                    $('.suggestions ul li').click(function(e){
                        clickedQuery = $(this).text()
                        chrome.storage.local.get("startpage_autocomplete", function(e){
                            queries = e.startpage_autocomplete.suggestions;
                            last = e.startpage_autocomplete.last;
                            autocomplete = e.startpage_autocomplete.enabled;
    
    
                            try{
                                queries.filter(query => {
                                    return (query.query.toUpperCase() == clickedQuery.toUpperCase() && query.engine == engines[engine_index].name);
                                })[0].p++;
                                queries.filter(query => {
                                    return (query.query.toUpperCase() == clickedQuery.toUpperCase() && query.engine == engines[engine_index].name);
                                })[0].time = new Date().getTime();
                            } catch(e){
                                queries.push(
                                    {
                                        engine: engines[engine_index].name,
                                        query: $(".highlighted").eq(0).html(),
                                        p: 1,
                                        time: new Date().getTime()
                                    }
                                )
                            }
                            
                            queries.sort(function (a, b) {
                                return b.p - a.p;
                            });
    
    
                            chrome.storage.local.set({startpage_autocomplete:{
                                enabled: autocomplete,
                                suggestions: queries,
                                last: clickedQuery
                            }})
    
    
                            searchExit(enginePrefix(clickedQuery))
                            $("#input").val(clickedQuery);
    
    
                        });
                    })
                }, 5);
            });
        });

        if(keyDodge){
            e.preventDefault();
        }
        return;
    });

    $(document).keydown(function(e) {
        $("#input").focus();
        if(e.keyCode == 9){
            e.preventDefault();
        }
    });

    $("#input").keyup(function(e) {
        if(keyDodge){
            e.preventDefault();
        }
        keyDodge = false;
        return;
    });

    // ---------------------------------------------------- ANIMATIONS -------------------------------------------------------------------

    setTimeout(function(){
        $(".bar_ini").addClass("bar");
        $(".bar_ini").removeClass("bar_ini");
        $(".top_left_icon").removeClass("opacity-0");
        setTimeout(function(){
            updateWeatherDisplay();
        }, 500);
        setTimeout(function(){
            progress = ((new Date().getHours() * 3600) + (new Date().getMinutes()) * 60 + (new Date().getSeconds())) / (24 * 36);
            $(".time").css("transform", "translateX(" + progress + "%)")
            $(".clock .hour").css("opacity", 1);
            $(".clock .minute").css("opacity", 1);
            if($(".header").width() * (100- progress) / 100 > 75){
                $(".clock").css("transform", "translateX(" + progress + "%)");
                $(".clock").removeClass("shiftLeft");
            } else {
                $(".clock").css("transform", "translateX(100%)");
            }
            setTimeout(function(){
                done = true;
                $(".second").css("opacity", 1);
            }, 2900);
        }, 800);
    }, 150);

    setTimeout(startWeather, 600000)


    // ---------------------------------------------------- CLICK HANDLERS -------------------------------------------------------------------

    // main

    $("#yt img").click(function(){clicked("#yt")});
    $("#sc img").click(function(){clicked("#sc")});
    $("#tv img").click(function(){clicked("#tv")});
    $("#tw img").click(function(){clicked("#tw")});
    $("#g img").click(function(){clicked("#g")});

    $("#yts").click(function(){clicked("#yt", "subscriptions")});
    $("#ttt").click(function(){clicked("#yt", "ttt")});
    $("#hds").click(function(){clicked("#yt", "hdsoundi")});

    $("#scl").click(function(){clicked("#sc", "likes")});
    $("#sch").click(function(){clicked("#sc", "history")});

    $("#tv22").click(function(){clicked("#tv", "2200")});
    $("#tvt").click(function(){clicked("#tv", "tomorrow")});
    $("#tvf").click(function(){clicked("#tv", "friday")});

    $("#nb3").click(function(){clicked("#tw", "nightblue3")});
    $("#nasa").click(function(){clicked("#tw", "nasa")});
    $("#shr").click(function(){clicked("#tw", "shroud")});

    $("#prf").click(function(){clicked("#g", "profile")});
    $("#rall").click(function(){clicked("#g", "all")});

    $(".top_right_icon").click(function(){searchExit("https://calendar.google.com/calendar/r")});
    $("#side-github").click(function(){searchExit("https://github.com/")});
    $("#side-desmos").click(function(){searchExit("https://www.desmos.com/calculator/")});
    $("#side-translate").click(function(){searchExit("https://translate.google.com/")});

    $("#yt img").hover(function(){if(!exitPage)hoverIn("#yt")}, function(){setTimeout(function(){if(!exitPage && !dropdown_hovered)hoverOut("#yt")}, 10)});
    $("#sc img").hover(function(){if(!exitPage)hoverIn("#sc")}, function(){setTimeout(function(){if(!exitPage && !dropdown_hovered)hoverOut("#sc")}, 10)});
    $("#tv img").hover(function(){if(!exitPage)hoverIn("#tv")}, function(){setTimeout(function(){if(!exitPage && !dropdown_hovered)hoverOut("#tv")}, 10)});
    $("#tw img").hover(function(){if(!exitPage)hoverIn("#tw")}, function(){setTimeout(function(){if(!exitPage && !dropdown_hovered)hoverOut("#tw")}, 10)});
    $("#g img").hover(function(){if(!exitPage)hoverIn("#g")}, function(){setTimeout(function(){if(!exitPage && !dropdown_hovered)hoverOut("#g")}, 10)});
    $(".sidebar").hover(function(){$(".top_right_icon").addClass("opacity-0")}, function(){$(".top_right_icon").removeClass("opacity-0")});
    $(".settings p").click(function(){searchExit("https://github.com/Usernameeeeeeeee/startpage")})

    // dropdown

    $(document).bind("contextmenu",function(e){
        e.preventDefault();
        switch(hovered){
            case "#yt":
                $("#yt .dropdown").css("left", e.pageX-1);
                $("#yt .dropdown").css("top" ,e.pageY-1);     
                $("#yt .dropdown").fadeIn(120,startFocusOut("yt")); 
                break;
            case "#sc":
                $("#sc .dropdown").css("left", e.pageX - 1);
                $("#sc .dropdown").css("top" ,e.pageY - 1);     
                $("#sc .dropdown").fadeIn(120,startFocusOut("sc")); 
                break;
            case "#tv":
                $("#tv .dropdown").css("left", e.pageX - 1);
                $("#tv .dropdown").css("top" ,e.pageY - 1);     
                $("#tv .dropdown").fadeIn(120,startFocusOut("tv")); 
                break;
            case "#tw":
                $("#tw .dropdown").css("left", e.pageX - 1);
                $("#tw .dropdown").css("top" ,e.pageY - 1);     
                $("#tw .dropdown").fadeIn(120,startFocusOut("tw")); 
                break;
            case "#g":
                if(e.pageX > $(".header").width() - $("#g .dropdown").width()){
                    $("#g .dropdown").css("left", e.pageX - $("#g .dropdown").width() + 1);
                } else {
                    $("#g .dropdown").css("left", e.pageX - 1);
                }
                $("#g .dropdown").css("top" ,e.pageY - 1);     
                $("#g .dropdown").fadeIn(120,startFocusOut("g")); 
                break;
            default:
                // $(".dropdown").css("left", e.pageX - 1);
                // $(".dropdown").css("top" ,e.pageY - 1);     
                // $(".dropdown").fadeIn(120,startFocusOut()); 
                break;
        }     
    });
    
    $(".dropdown").hover(function(){
        dropdown_hovered = true;
    },function(){
        manageHovered();
    }); 

	$(".dark-mode input").click(function(){
		darkmode = !darkmode;
        chrome.storage.local.get("startpage_settings", function(e){
            let startpage_settings = e.startpage_settings;
            startpage_settings.darkmode = darkmode;
            chrome.storage.local.set({startpage_settings:startpage_settings})
            updateDarkMode();
        });
        chrome.storage.local.get("startpage_selected_profile", function(a){
            let startpage_selected_profile = a.startpage_selected_profile;
            if(startpage_selected_profile != ""){
                chrome.storage.local.get("startpage_profiles", function(pr){
                    let startpage_profiles = pr.startpage_profiles;
                    startpage_profiles.filter(profile => profile.name == startpage_selected_profile)[0].settings.darkmode = darkmode;
                    
                    chrome.storage.local.set({startpage_profiles:startpage_profiles})
                });
            }
        });
    });

    $("#settings").click(function(){
        chrome.runtime.sendMessage({navigate:"/settings/settings.html", newTab: "true"});
    })
});