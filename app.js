/*global Ext */
Ext.application({
    icon: 'launcher_icon.png',
    launch: function() {
                        
        var songInfoFetcher;
        
        // expecting a pipe delimited string
        // Pete Donnelly | Can't Talk At All | When You Come Home | 3:44 | Pete Donnelly | 2/21/2012 21:33:33        
        var parseSongString = function(delimitedString) {

            var data = delimitedString.split("|");
            
            return {
                artist: data[0].trim(), 
                name: data[1].trim(),
                album: data[2].trim()                
            };
            
        };        
        
        var getCurrentSongInfo = function() {
            Ext.data.JsonP.request({
                url: 'http://query.yahooapis.com/v1/public/yql',
                callbackKey: 'callback',
                params: {
                    q: 'select p from html where url="http://xpn.org/playlist/xpn_now_playing.html"',
                    format: 'json',
                    diagnostics: false,
                    callback: 'callback'
                },
                success: function(result) {
                    // DANGER THIS IS REALLY FRAGILE - TODO FIX ME
                    var song = parseSongString(result.query.results.body.p);
                    Ext.getCmp('info').setHtml(song.artist + "<br/>" + song.name);
                }
            });            
        };        
                                
        Ext.create('Ext.Container', {
            fullscreen: true,
            layout: {
                type: 'vbox',
                pack: 'center'
            },
            items: [
                {
                    xtype : 'toolbar',
                    docked: 'top',
                    title : 'WXPN Radio'
                },
                {
                    xtype: 'toolbar',
                    docked: 'bottom',
                    defaults: {
                        xtype: 'button',
                        handler: function() {
                            var container = this.getParent().getParent(),
                                // use ComponentQuery to get the audio component (using its xtype)
                                audio = container.down('audio');

                            audio.toggle();
                            this.setText(audio.isPlaying() ? 'Pause' : 'Play');
                        }
                    },
                    items: [
                        { text: 'Play', flex: 1 }
                    ]
                },              
                {
                    id: "info",
                    html: 'Welcome to WXPN Radio',
                    styleHtmlContent: true
                },
                {
                    xtype : 'audio',
                    hidden: true,
                    url   : 'http://xpn-mobile.streamguys.com/xpnandroid',
                    listeners: {
                        play: function() {
                            getCurrentSongInfo();
                            songInfoFetcher = setInterval(getCurrentSongInfo, 20000);
                        },
                        pause: function() {
                            clearInterval(songInfoFetcher);
                            Ext.getCmp('info').setHtml("Thanks for listening to WXPN Radio");
                        }
                    }
                }
            ]
        });
        
    }
});

