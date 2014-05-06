$(function(){

	var socket = io.connect('http://localhost');
	
	// 接続したとき
	socket.on('connect', function(){
		console.log('connected');

		var mon = $('#table').attr('mon');
		socket.emit('getSchedule',mon);

	});

	// 予定のリストを取得
	socket.on('getSchedule',function(cals){
		console.log(cals);
		for(var i=0; i<cals.length; i++){
			var cal = cals[i];
			if(cal.empty == false){
				// ぬりつぶす
				var date = new Date(cal.date);
				date = '2014-'+(date.getMonth()+1)+'-'+date.getDate();
				console.log(date);
				$('#'+date).toggleClass('selected');
			}
		}
	});

	// 誰かがカレンダーを選択したことを受信
	socket.on('selected', function(selectedDate){
		$('#'+selectedDate).toggleClass('selected');
	});
	// 左ボタンが押されたとき
	$('#left').click(function(){
		var to =$(this).attr('to');
		if (to<0) to = 11;
			location.href = "/?mon="+to;
	});

	$('#right').click(function(){
		var to = $(this).attr('to');
		if (to>11) to =0;
		location.href = "/?mon="+to;
	});

	$('td').click(function(){
		socket.emit('selected', $(this).attr('id')); // サーバーにカレンダーを選択したことを送信
	});
});