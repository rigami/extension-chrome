console.log(`





           |'-.._____..-'|
           :  > .  ,  <  :
           './ __'' __ |,'
            | (|_) (|_) |
            ; _  .  __  :
            '.,' - '-. ,'
              ', '_  .'
              /       |
             /         :
            :          |_
           ,|  .    .  | |
          : :   |   |  |  :
          |  |   :'-;  ;  |
          :   :  | /  /   ;
           :-.'  ;'  / _,''------.
           '''''-''''-'-''--.---  )
                            '----'
             Hi, friend)      
        You found me, you won





`);
console.log("cat: Let's play");
console.log('my_answer("How?");');
console.log("cat: I will ask you a riddle");
console.log("cat: Tell me if you want");

function my_answer(answr){
	Window.DB.sendRequest("http://danilkinkin.com/projects/clockTab/game.php", {
		my_answer: answr.toLowerCase().replace(/ /g, "")
	},
	function(result){
		console.log(result);
	});
}