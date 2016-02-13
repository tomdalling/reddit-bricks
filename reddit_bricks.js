(function(){
  var DEFAULT_SUBS = 'pixelart',
      IMGUR_PIC_REGEXES = [
        /(i\.)?imgur.com\/[a-zA-Z0-9]{7}$/,
        /(i\.)?imgur.com\/[a-zA-Z0-9]{7}\./
      ];

  function remove_extension(url) {
    var last_slash = url.lastIndexOf('/')
        last_dot = url.lastIndexOf('.');

    if(last_dot > last_slash){
      return url.substring(0, last_dot);
    } else {
      return url;
    }
  }

  function video_element(sources){
    var $video = $('<video />').attr({
      autoplay: 'autoplay',
      loop: 'loop',
      muted: 'muted'
    });
    _.each(sources, function(src, type){
      $('<source />').attr({ type: type, src: src }).appendTo($video);
    });
    return $video;
  }

  function add_imgur_url(url) {
    var last_slash = url.lastIndexOf('/')
        last_dot = url.lastIndexOf('.')
        full_url = url + (last_slash > last_dot ? '.jpg' : '')
        extension = full_url.substr(full_url.lastIndexOf('.') + 1)
        base = remove_extension(full_url);

    if(extension === 'gifv' || extension === 'webm' || extension == 'mp4'){
      video_element({
        'video/webm': base + '.webm',
        'video/mp4': base + '.mp4',
      }).appendTo('body');
    } else {
      $('<img />').attr('src', full_url).appendTo('body');
    }
  }

  function is_imgur_url(url) {
    return _.some(IMGUR_PIC_REGEXES, function(regex){
      return url.match(regex);
    });
  }

  function is_gfycat_url(url) {
    return url.match(/gfycat\.com/);
  }

  function add_gfycat_url(url) {
    var no_ext = remove_extension(url),
        id = no_ext.substr(no_ext.lastIndexOf('/') + 1);

    $.ajax({
      url: 'https://gfycat.com/cajax/get/' + id,
      success: function(data, status, xhr){
        video_element({
          'video/webm': data.gfyItem.webmUrl,
          'video/mp4': data.gfyItem.mp4Url,
        }).appendTo('body');
      },
    });
  }

  function add_post(post) {
    var url = post.url;
    if(is_imgur_url(url)){
      add_imgur_url(url);
    } else if(is_gfycat_url(url)) {
      add_gfycat_url(url);
    } else {
      console.log('unhandled url: ' + url);
    }
  }

  function add_results(results) {
    _.each(results.data.children, function(post_container){
      add_post(post_container.data);
    });
  }

  function request_results(){
    subreddits = (window.location.hash || '#' + DEFAULT_SUBS).substr(1)
    $.ajax({
      url: 'https://www.reddit.com/r/'+subreddits+'/hot.json',
      success: function(data, status, xhr){ add_results(data); },
      data: {
        limit: 100,
      }
    });
  }

  $(request_results);

  window.bricks = {
  }
})();
