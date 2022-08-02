$( document ).ready(function() {
  //Default values
  $('.title').html("<h3>Please login in your device</h3>");

  //Verify localStorage and validate session with device
    if(localStorage.getItem('session') && localStorage.getItem('ip')){
      validateSession();
    }else{
      WithOutSession();
    }

    //Button clicks
    $('.start-btn').on('click',function(){
      $('.principal-ly').hide();
      $('.login-ly').show();
    });

    $('.back-btn').on('click',function(){
      $('.principal-ly').show();
      $('.login-ly').hide();
      $('#ip').val('');
      $('#password').val('');
    });

    $('.login-btn').on('click',function(){
      CreateSession();
    });

    $('.reset-btn').on('click',function(){
      ResetConfigAndKeepIPAddress()
    });

    $('.logout-btn').on('click',function(){
      logOut();
    });

    $('.restart-btn').on('click',function(){
      RestartDevice()
    })

    function validateSession(){
      $.ajax({
        url: "http://"+localStorage.getItem('ip')+"/session_is_valid.fcgi?session=" + localStorage.getItem('session'),
        type: 'POST',
        contentType: 'application/json',
        success:function(valid){
          if (valid) {
            WithSession(localStorage.getItem('ip'),localStorage.getItem('session'));
          }else{
            WithOutSession();
          }
        }
      });
    };

    function CreateSession(){
      let ip = $('#ip').val();
      let password = $('#password').val();
      $.ajax({
        url: "http://"+ip+"/login.fcgi",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            login: 'admin',
            password: password
        }),
        success: function(data) {
            localStorage.setItem('session', data.session);
            localStorage.setItem('ip', ip);
            WithSession(ip,data.session);
        },
        error:function(err){
          if(err.status===401)
          {
            $('.msg-danger').text('Error, incorrect user o password').show();
            setTimeout(function(){$('.msg-danger').hide()},4000);
            return;
          }
          $('.msg-danger').text('Another error, no session started').show();
          setTimeout(function(){$('.msg-danger').hide()},4000);
          WithOutSession();
        }
      });
    }

    function WithOutSession(){
      localStorage.removeItem('session');
      localStorage.removeItem('ip');
      $('#ip').val('');
      $('#password').val('');
    };

    function WithSession(ip, session){
      $('.title').html('<h3>With session on: '+ip+'</h3>');
      $('.form-login').hide();
      $('.form-options').show();
    };

    function ResetConfigAndKeepIPAddress(){
      $.ajax({
        url: "http://"+localStorage.getItem('ip')+"/reset_to_factory_default.fcgi?session=" + localStorage.getItem('session'),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            keep_network_info : true
        }),
      });
      $('.msg-warning').text('Please wait, device will reboot in 60 seconds...').show();
      setTimeout(function(){$('.msg-warning').hide()},60000);
      setTimeout(function(){
        RestartDevice();
      },60000)
    };

    function RestartDevice(){
      $.ajax({
          url: "http://"+localStorage.getItem('ip')+"/reboot.fcgi?session=" + localStorage.getItem('session'),
          type: 'POST',
          contentType: 'application/json'
      });
    };

    function logOut(){
      $.ajax({
          url: "http://"+localStorage.getItem('ip')+"/logout.fcgi?session=" + localStorage.getItem('session'),
          type: 'POST',
          contentType: 'application/json',
          // success: function(data) {
          //   WithOutSession();
          // },
          // error:function(err){
          //   $('.msg-warning').text('It is not possible to unlink device, THIS ISN\'T AN ERROR').show();
          //   setTimeout(function(){$('.msg-warning').hide()},4000);
          //   WithOutSession();
          // }
        });
        WithOutSession();
        setTimeout(function(){window.location.reload()},1000);
    };
});

function setLanguage(language){
  $.ajax({
    url: "http://"+localStorage.getItem('ip')+"/set_configuration.fcgi?session=" + localStorage.getItem('session'),
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      general: {"language":language}
    }),
    success:function(data){
      $('.msg-warning').text('Language has changed successfully! please restart session on web GUI.').show();
      setTimeout(function(){$('.msg-warning').hide()},4000);
    },
    error:function(err){
      $('.msg-danger').text('Another error, no language has changed').show();
      setTimeout(function(){$('.msg-warning').hide()},4000);
    }
  });
};
