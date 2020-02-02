# 二次元音響FDTD速度比較 by Yoshiki NAGATANI 20180827 (https://ultrasonics.jp/nagatani/fdtd/)
#  optimized by Takahiro Kawashima 20180828
#  disabled file output for testing speed 20180829
#  optimized by Yoshiki NAGATANI thanks to honorable followers 20180829

using Printf

# パフォーマンス向上のために全ての処理を関数化
function FDTD()
	NX = 300								# 空間セル数 X [pixels]
	NY = 400								# 空間セル数 Y [pixels]

	dx = 0.01								# 空間刻み [m]
	dt = 20.0e-6							# 時間刻み [s]

	Nstep = 10000							# 計算ステップ数 [回]

	freq = 1.0e3							# 初期波形の周波数 [Hz]

	ρ = 1.3									# 密度ρ [kg/m^3]
	κ = 142.0e3								# 体積弾性率κ [Pa]

	Vx = zeros(Float64, NX+1,NY  )			# x方向粒子速度 [m/s]
	Vy = zeros(Float64, NX,  NY+1)			# y方向粒子速度 [m/s]
	P  = zeros(Float64, NX,  NY  )			# 音圧 [Pa]

	# 事前準備 #########################################################
	waveformfile = open("waveform.txt", "w")

	# メインループ #########################################################
	for n = 0:Nstep

		# 更新（ここが FDTD の本体）
		# 粒子速度の更新
		for j=1:NY
			for i=2:NX
				Vx[i,j] = Vx[i,j] - (dt / (ρ * dx)) * ( P[i,j] - P[i-1,j] );
			end
		end
		for j=2:NY
			for i=1:NX
				Vy[i,j] = Vy[i,j] - (dt / (ρ * dx)) * ( P[i,j] - P[i,j-1] );
			end
		end
		# 音圧の更新
		for j=1:NY
			for i=1:NX
				P[i,j] = P[i,j] - ( κ * dt / dx ) * ( ( Vx[i+1,j] - Vx[i,j] ) + ( Vy[i,j+1] - Vy[i,j] ) );
			end
		end

		# 初期波形を準備（正弦波×１波 with ハン窓）
		if n < (1.0/freq)/dt
			sig = (1.0-cos(2.0*pi*freq*n*dt))/2.0 * sin(2.0*pi*freq*n*dt)
		else
			sig = 0.0
		end

		# 音源
		P[NX÷4+1,NY÷3+1] = sig

		# 波形ファイル出力（時刻, 音源, 中央点の音圧）
		write(waveformfile,"$(dt*n)\t$sig\t$(P[Int32(floor(NX/2+1)),Int32(floor(NY/2+1))])\n")

		# 音圧分布ファイル出力（50ステップ毎）
		if n % 50 == 0
			@printf("%5d / %5d\r", n, Nstep);
#			音場ファイルを出力する場合は以下のコメントを外して下さい
			fieldfilename = @sprintf("field%06d.txt",n)
			fieldfile = open(fieldfilename,"w")
			for i=1:NX
				for j=1:NY
					write(fieldfile,P[i,j],"\t")
				end
				write(fieldfile,"\n")
			end/
			close(fieldfile)
		end
	end

	# 事後処理 #########################################################
	close(waveformfile)

end

# 全ての処理を実行
FDTD()